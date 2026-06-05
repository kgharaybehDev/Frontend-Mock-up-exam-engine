import { Component, inject, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExamService } from '../../../core/services/exam.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { TimerDisplayComponent } from '../../../shared/components/timer-display/timer-display.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { QuestionCardComponent } from '../components/question-card/question-card.component';
import { QuestionNavigatorComponent } from '../components/question-navigator/question-navigator.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

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
  private attemptId = '';

  ngOnInit() {
    const attemptId = this.route.snapshot.paramMap.get('attemptId');
    if (!attemptId) {
      this.errorMessage.set('Invalid attempt ID.');
      this.isLoading.set(false);
      return;
    }

    this.attemptId = attemptId;

    const session = this.examService.session();
    if (session && session.attemptId === attemptId) {
      this.isLoading.set(false);
      this.startTimer();
      return;
    }

    this.examService.resumeAttempt(attemptId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.examService.loadSessionFromResume(res.data);
          this.startTimer();
        } else {
          this.errorMessage.set(res.error || 'Failed to load attempt.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error || 'Failed to load attempt. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  ngOnDestroy() {
    this.stopTimer();
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

  navigateTo(index: number) {
    if (index >= 0 && index < this.totalQuestions()) {
      this.examService.currentIndex.set(index);
    }
  }

  goNext() {
    if (!this.isLastQuestion()) {
      this.examService.currentIndex.update((i) => i + 1);
    }
  }

  goPrev() {
    if (!this.isFirstQuestion()) {
      this.examService.currentIndex.update((i) => i - 1);
    }
  }

  onAnswerChange(attemptQuestionId: string, value: string) {
    this.examService.setAnswer(attemptQuestionId, value);
    this.examService.saveAnswer(this.attemptId, attemptQuestionId, value).subscribe({
      error: () => this.toast.error('Failed to save answer.'),
    });
  }

  onFlagToggle(attemptQuestionId: string) {
    const currentFlag = this.questions().find((q) => q.attemptQuestionId === attemptQuestionId)?.isFlagged ?? false;
    const newFlag = !currentFlag;
    const questions = this.questions().map((q) =>
      q.attemptQuestionId === attemptQuestionId ? { ...q, isFlagged: newFlag } : q
    );
    const session = this.examService.session();
    if (session) {
      this.examService.session.set({ ...session, questions });
    }
    this.examService.flagQuestion(this.attemptId, attemptQuestionId, newFlag).subscribe({
      error: () => this.toast.error('Failed to update flag.'),
    });
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

    const finalAnswers = this.questions().map((q) => ({
      attemptQuestionId: q.attemptQuestionId,
      answerText: this.answers()[q.attemptQuestionId] || '',
    }));

    this.examService.finishExam(this.attemptId, finalAnswers).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.examService.submitResult.set(res.data);
          this.examService.clearSession();
          this.router.navigate(['/exam/result', this.attemptId]);
        } else {
          this.toast.error(res.error || 'Failed to submit exam.');
          this.isSubmitting.set(false);
          this.startTimer();
        }
      },
      error: () => {
        this.toast.error('Failed to submit exam. Please try again.');
        this.isSubmitting.set(false);
        this.startTimer();
      },
    });
  }

  confirmAbandon() {
    this.showAbandonModal.set(false);
    this.stopTimer();
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
