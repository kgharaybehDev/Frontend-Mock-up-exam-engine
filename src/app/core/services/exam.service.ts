import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import type { ApiResponse } from '../models/api-response.model';
import type { AttemptAttachmentDto, AttemptStartDto, AttemptResumeDto, AttemptSubmitResultDto, FinalAnswerSubmission, QuestionOptionDto } from '../models/attempt.model';
import type { ExamReportDto, QuestionPageDto } from '../models/report.model';
import { API_BASE_URL } from '../tokens/api-url.token';

export interface ExamSessionQuestion {
  attemptQuestionId: string;
  orderIndex: number;
  questionBody: string;
  questionType: string;
  options: QuestionOptionDto[];
  attachments: AttemptAttachmentDto[];
  savedAnswer: string;
  isFlagged: boolean;
}

export interface ExamSession {
  attemptId: string;
  examId: string;
  examTitle: string;
  navigationType: string;
  remainingSeconds: number;
  status: string;
  questions: ExamSessionQuestion[];
}

@Injectable({ providedIn: 'root' })
export class ExamService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiBase = inject(API_BASE_URL);

  private readonly examApi = `${this.apiBase}/api/v1/exams`;
  private readonly attemptApi = `${this.apiBase}/api/v1/attempts`;

  readonly session = signal<ExamSession | null>(null);
  readonly currentIndex = signal(0);
  readonly answers = signal<Record<string, string>>({});
  readonly isSubmitting = signal(false);
  readonly submitResult = signal<AttemptSubmitResultDto | null>(null);

  readonly questionTimeSpent = signal<Record<string, number>>({});
  private questionEntryTimes: Record<string, number> = {};

  readonly questions = computed(() => this.session()?.questions ?? []);
  readonly currentQuestion = computed(() => this.questions()[this.currentIndex()] ?? null);
  readonly totalQuestions = computed(() => this.questions().length);
  readonly answeredCount = computed(() => Object.keys(this.answers()).length);
  readonly progress = computed(() => this.totalQuestions() > 0 ? (this.answeredCount() / this.totalQuestions()) * 100 : 0);
  readonly isFirstQuestion = computed(() => this.currentIndex() === 0);
  readonly isLastQuestion = computed(() => this.currentIndex() === this.totalQuestions() - 1);
  readonly navigationType = computed(() => this.session()?.navigationType ?? 'free');

  startExam(examId: string) {
    return this.http.post<ApiResponse<AttemptStartDto>>(`${this.examApi}/${examId}/start`, {});
  }

  resumeAttempt(attemptId: string) {
    return this.http.get<ApiResponse<AttemptResumeDto>>(`${this.attemptApi}/${attemptId}`);
  }

  saveAnswer(attemptId: string, attemptQuestionId: string, answerText: string) {
    return this.http.put<ApiResponse<unknown>>(`${this.attemptApi}/${attemptId}/questions/${attemptQuestionId}/answer`, { answerText });
  }

  flagQuestion(attemptId: string, attemptQuestionId: string, isFlagged: boolean) {
    return this.http.put<ApiResponse<unknown>>(`${this.attemptApi}/${attemptId}/questions/${attemptQuestionId}/flag`, { isFlagged });
  }

  finishExam(attemptId: string, finalAnswers: FinalAnswerSubmission[]) {
    return this.http.post<ApiResponse<AttemptSubmitResultDto>>(`${this.attemptApi}/${attemptId}/submit`, { finalAnswers });
  }

  abandonExam(attemptId: string) {
    return this.http.post<ApiResponse<unknown>>(`${this.attemptApi}/${attemptId}/abandon`, {});
  }

  private normalizeQuestions(data: AttemptStartDto | AttemptResumeDto): ExamSessionQuestion[] {
    return data.questions.map((q) => ({
      attemptQuestionId: q.attemptQuestionId,
      orderIndex: q.orderIndex,
      questionBody: q.questionBody,
      questionType: q.questionType,
      options: q.options ?? [],
      attachments: q.attachments,
      savedAnswer: 'savedAnswer' in q ? (q as any).savedAnswer ?? '' : '',
      isFlagged: 'isFlagged' in q ? (q as any).isFlagged ?? false : false,
    }));
  }

  loadSessionFromStart(data: AttemptStartDto) {
    const questions = this.normalizeQuestions(data);
    this.session.set({
      attemptId: data.attemptId,
      examId: data.examId,
      examTitle: data.examTitle,
      navigationType: data.navigationType,
      remainingSeconds: Math.max(data.durationMinutes * 60, data.durationSeconds),
      status: 'in-progress',
      questions,
    });
    this.currentIndex.set(0);
    const answers: Record<string, string> = {};
    const flags: Record<string, boolean> = {};
    for (const q of questions) {
      if (q.savedAnswer) answers[q.attemptQuestionId] = q.savedAnswer;
      if (q.isFlagged) flags[q.attemptQuestionId] = true;
    }
    this.answers.set(answers);
    this.isSubmitting.set(false);
    this.submitResult.set(null);
    this.questionTimeSpent.set({});
    this.questionEntryTimes = {};
  }

  loadSessionFromResume(data: AttemptResumeDto) {
    const questions = this.normalizeQuestions(data);
    this.session.set({
      attemptId: data.attemptId,
      examId: data.examId,
      examTitle: '',
      navigationType: data.navigationType,
      remainingSeconds: data.remainingSeconds,
      status: data.status,
      questions,
    });
    this.currentIndex.set(0);
    const answers: Record<string, string> = {};
    const flags: Record<string, boolean> = {};
    for (const q of questions) {
      if (q.savedAnswer) answers[q.attemptQuestionId] = q.savedAnswer;
      if (q.isFlagged) flags[q.attemptQuestionId] = true;
    }
    this.answers.set(answers);
    this.isSubmitting.set(false);
    this.submitResult.set(null);
    this.questionTimeSpent.set({});
    this.questionEntryTimes = {};
  }

  setAnswer(attemptQuestionId: string, answer: string) {
    this.answers.update((a) => ({ ...a, [attemptQuestionId]: answer }));
  }

  getAnswer(attemptQuestionId: string): string {
    return this.answers()[attemptQuestionId] ?? '';
  }

  updateSessionTitle(title: string) {
    const s = this.session();
    if (s) {
      this.session.set({ ...s, examTitle: title });
    }
  }

  clearSession() {
    this.session.set(null);
    this.currentIndex.set(0);
    this.answers.set({});
    this.isSubmitting.set(false);
    this.questionTimeSpent.set({});
    this.questionEntryTimes = {};
  }

  checkReport(attemptId: string) {
    return this.http.get<ApiResponse<unknown>>(`${this.apiBase}/api/v1/reports/${attemptId}`);
  }

  getExamReport(attemptId: string) {
    return this.http.get<ApiResponse<ExamReportDto>>(`${this.apiBase}/api/v1/reports/${attemptId}`);
  }

  getPaginatedQuestions(attemptId: string, page: number, pageSize: number, status?: string) {
    const params: Record<string, string | number> = { page, pageSize };
    if (status) params['status'] = status;
    return this.http.get<ApiResponse<QuestionPageDto>>(`${this.apiBase}/api/v1/reports/${attemptId}/questions`, { params: params as any });
  }

  recordQuestionEntry(attemptQuestionId: string) {
    this.questionEntryTimes[attemptQuestionId] = Date.now();
  }

  recordQuestionExit(attemptQuestionId: string) {
    const entered = this.questionEntryTimes[attemptQuestionId];
    if (entered) {
      const elapsed = Math.round((Date.now() - entered) / 1000);
      this.questionTimeSpent.update((t) => ({
        ...t,
        [attemptQuestionId]: (t[attemptQuestionId] ?? 0) + elapsed,
      }));
    }
    delete this.questionEntryTimes[attemptQuestionId];
  }

  flushAllQuestionTimes() {
    const now = Date.now();
    for (const [qId, entered] of Object.entries(this.questionEntryTimes)) {
      const elapsed = Math.round((now - entered) / 1000);
      this.questionTimeSpent.update((t) => ({
        ...t,
        [qId]: (t[qId] ?? 0) + elapsed,
      }));
    }
    this.questionEntryTimes = {};
  }

  getQuestionTime(attemptQuestionId: string): number {
    return this.questionTimeSpent()[attemptQuestionId] ?? 0;
  }
}
