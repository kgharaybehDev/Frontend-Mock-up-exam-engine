import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExamProgressService } from '../../../core/services/exam-progress.service';
import { ExamService } from '../../../core/services/exam.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { TimerDisplayComponent } from '../../../shared/components/timer-display/timer-display.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { QuestionCardComponent } from '../components/question-card/question-card.component';
import { QuestionNavigatorComponent } from '../components/question-navigator/question-navigator.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import type { CandidateAttemptDto } from '../../../core/models/attempt.model';

@Component({
  selector: 'app-exam-session',
  standalone: true,
  imports: [
    RouterLink,
    TimerDisplayComponent,
    ProgressBarComponent,
    ButtonComponent,
    QuestionCardComponent,
    QuestionNavigatorComponent,
    ModalComponent,
  ],
  templateUrl: './exam-session.component.html',
})
export class ExamSessionComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly examService = inject(ExamService);
  private readonly examProgress = inject(ExamProgressService);
  private readonly toast = inject(ToastService);

  readonly session = this.examService.session;
  readonly currentIndex = this.examService.currentIndex;
  readonly questions = this.examService.questions;
  readonly currentQuestion = this.examService.currentQuestion;
  readonly totalQuestions = this.examService.totalQuestions;
  readonly answeredCount = this.examService.answeredCount;
  readonly progress = this.examService.progress;
  readonly isFirstQuestion = this.examService.isFirstQuestion;
  readonly isLastQuestion = this.examService.isLastQuestion;
  readonly navigationType = this.examService.navigationType;
  readonly answers = this.examService.answers;
  readonly isSubmitting = this.examService.isSubmitting;

  readonly isLoading = signal(true);
  readonly showSubmitModal = signal(false);
  readonly showAbandonModal = signal(false);
  readonly errorMessage = signal('');

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private storageInterval: ReturnType<typeof setInterval> | null = null;
  private attemptId = '';

  ngOnInit() {
    const param = this.route.snapshot.paramMap.get('attemptId');
    if (!param) {
      this.errorMessage.set('Invalid attempt ID.');
      this.isLoading.set(false);
      return;
    }

    const session = this.examService.session();
    if (session && session.attemptId === param) {
      this.attemptId = param;
      this.isLoading.set(false);
      this.startTimer();
      this.startStorageSync();
      this.examService.startAutosaveInterval(param);
      this.recordEntry();
      this.addBeforeUnload();
      this.examProgress.loadProgress(param).subscribe();
      return;
    }

    this.tryResume(param);
  }

  private tryResume(param: string) {
    const restored = this.examService.restoreProgressFromStorage(param);

    this.examService.resumeExam(param).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.attemptId = res.data.attemptId;
          this.examService.loadSessionFromResume(res.data);
          this.startTimer();
          this.startStorageSync();
          this.examService.startAutosaveInterval(this.attemptId);
          this.recordEntry();
          this.addBeforeUnload();
          this.examProgress.loadProgress(this.attemptId).subscribe();
          this.isLoading.set(false);
        } else {
          this.errorMessage.set(res.error || 'Failed to load attempt.');
          this.isLoading.set(false);
        }
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404 || err.status === 409) {
          this.findAndResumeActiveAttempt(param);
        } else {
          this.errorMessage.set('Failed to load attempt. Please try again.');
          this.isLoading.set(false);
        }
      },
    });
  }

  private findAndResumeActiveAttempt(id: string) {
    this.examService.getActiveAttempts().subscribe({
      next: (res) => {
        if (!res.success || !res.data?.items?.length) {
          this.errorMessage.set('No active session found for this exam.');
          this.isLoading.set(false);
          return;
        }

        const match = res.data.items.find(
          (a: CandidateAttemptDto) =>
            (a.examId === id || a.attemptId === id) && a.status === 'in-progress',
        );

        if (!match) {
          this.errorMessage.set('No active session found for this exam.');
          this.isLoading.set(false);
          return;
        }

        this.attemptId = match.attemptId;
        this.examService.resumeExam(match.attemptId).subscribe({
          next: (r) => {
            if (r.success && r.data) {
              this.examService.loadSessionFromResume(r.data);
              this.startTimer();
              this.startStorageSync();
              this.examService.startAutosaveInterval(match.attemptId);
              this.recordEntry();
              this.addBeforeUnload();
              this.examProgress.loadProgress(match.attemptId).subscribe();
            } else {
              this.errorMessage.set(r.error || 'Failed to resume exam.');
            }
            this.isLoading.set(false);
          },
          error: () => {
            this.errorMessage.set('Failed to resume your exam session.');
            this.isLoading.set(false);
          },
        });
      },
      error: () => {
        this.errorMessage.set('Unable to retrieve your exam sessions.');
        this.isLoading.set(false);
      },
    });
  }

  private beforeUnloadHandler = () => {
    this.examService.flushAllQuestionTimes();
    this.examService.saveProgressToStorage(this.attemptId);
  };

  private addBeforeUnload() {
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }

  private removeBeforeUnload() {
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
  }

  ngOnDestroy() {
    this.removeBeforeUnload();
    this.stopTimer();
    this.stopStorageSync();
    this.examService.stopAutosaveInterval();
    this.examProgress.clear();
  }

  private startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      const s = this.examService.session();
      if (s && s.remainingSeconds > 0) {
        s.remainingSeconds--;
        this.examService.session.set({ ...s });
        if (s.remainingSeconds <= 0) {
          this.onTimeUp();
        }
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private startStorageSync() {
    this.stopStorageSync();
    this.storageInterval = setInterval(() => {
      this.examService.saveProgressToStorage(this.attemptId);
    }, 5000);
  }

  private stopStorageSync() {
    if (this.storageInterval) {
      clearInterval(this.storageInterval);
      this.storageInterval = null;
    }
  }

  private recordExit() {
    const q = this.currentQuestion();
    if (q) {
      this.examService.recordQuestionExit(q.attemptQuestionId);
    }
  }

  private recordEntry() {
    const q = this.currentQuestion();
    if (q) {
      this.examService.recordQuestionEntry(q.attemptQuestionId);
    }
  }

  navigateTo(index: number) {
    if (index >= 0 && index < this.totalQuestions()) {
      this.recordExit();
      this.examService.currentIndex.set(index);
      this.recordEntry();
      this.examService.saveProgressToStorage(this.attemptId);
    }
  }

  goNext() {
    if (!this.isLastQuestion()) {
      this.recordExit();
      this.examService.currentIndex.update((i) => i + 1);
      this.recordEntry();
      this.examService.saveProgressToStorage(this.attemptId);
    }
  }

  goPrev() {
    if (!this.isFirstQuestion()) {
      this.recordExit();
      this.examService.currentIndex.update((i) => i - 1);
      this.recordEntry();
      this.examService.saveProgressToStorage(this.attemptId);
    }
  }

  onAnswerChange(attemptQuestionId: string, value: string) {
    this.examService.setAnswer(attemptQuestionId, value);
    this.examService.saveProgressToStorage(this.attemptId);
    this.examProgress.markAnswered(attemptQuestionId);
    this.examService.saveAnswer(this.attemptId, attemptQuestionId, value).subscribe();
  }

  onFlagToggle(attemptQuestionId: string) {
    const newFlag = this.examProgress.toggleFlag(attemptQuestionId);
    const questions = this.questions().map((q) =>
      q.attemptQuestionId === attemptQuestionId ? { ...q, isFlagged: newFlag } : q
    );
    const session = this.examService.session();
    if (session) {
      this.examService.session.set({ ...session, questions });
    }
    this.examService.saveProgressToStorage(this.attemptId);
    this.examService.flagQuestion(this.attemptId, attemptQuestionId, newFlag).subscribe();
  }

  openSubmitModal() {
    this.showSubmitModal.set(true);
  }

  openAbandonModal() {
    this.showAbandonModal.set(true);
  }

  confirmSubmit() {
    this.showSubmitModal.set(false);
    this.isSubmitting.set(true);
    this.stopTimer();
    this.stopStorageSync();
    this.examService.stopAutosaveInterval();

    this.examService.flushAllQuestionTimes();
    const finalAnswers = this.questions().map((q) => ({
      attemptQuestionId: q.attemptQuestionId,
      answerText: this.answers()[q.attemptQuestionId] || '',
      timeSpentSeconds: this.examService.getQuestionTime(q.attemptQuestionId),
    }));

    this.examService.finishExam(this.attemptId, finalAnswers).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.examService.submitResult.set(res.data);
          this.examService.clearSession();
          this.examService.clearProgressFromStorage(this.attemptId);
          this.router.navigate(['/exam/result', this.attemptId]);
        } else {
          this.toast.error(res.error || 'Failed to submit exam.');
          this.isSubmitting.set(false);
          this.startTimer();
          this.startStorageSync();
          this.examService.startAutosaveInterval(this.attemptId);
        }
      },
      error: () => {
        this.isSubmitting.set(false);
        this.startTimer();
        this.startStorageSync();
        this.examService.startAutosaveInterval(this.attemptId);
      },
    });
  }

  confirmAbandon() {
    this.showAbandonModal.set(false);
    this.stopTimer();
    this.stopStorageSync();
    this.examService.stopAutosaveInterval();
    this.examService.clearSession();
    this.examService.abandonExam(this.attemptId).subscribe();
    this.router.navigate(['/candidate/dashboard']);
  }

  private onTimeUp() {
    this.toast.warning('Time is up! Your exam will be submitted automatically.');
    this.confirmSubmit();
  }

  protected readonly answeredLabel = computed(() => {
    const answered = this.answeredCount();
    const total = this.totalQuestions();
    return `Answered ${answered} of ${total} questions`;
  });
}
