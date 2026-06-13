import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ExamProgressService } from '../../../core/services/exam-progress.service';
import { ExamService } from '../../../core/services/exam.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { QuestionNavigatorComponent } from '../components/question-navigator/question-navigator.component';
import type { ExamReportDto, QuestionDetailDto } from '../../../core/models/report.model';

@Component({
  selector: 'app-exam-report',
  standalone: true,
  imports: [RouterLink, DatePipe, CardComponent, QuestionNavigatorComponent],
  templateUrl: './exam-report.component.html',
})
export class ExamReportComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly examService = inject(ExamService);
  private readonly examProgress = inject(ExamProgressService);

  protected readonly attemptId = this.route.snapshot.paramMap.get('id') ?? '';

  protected readonly report = signal<ExamReportDto | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  protected readonly questions = signal<QuestionDetailDto[]>([]);
  protected readonly questionsLoading = signal(false);
  protected readonly totalCount = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 10;
  protected readonly activeFilter = signal<'All' | 'Incorrect' | 'Flagged'>('All');
  protected readonly expandedQuestions = signal<Set<number>>(new Set());
  protected readonly activeQuestionIndex = signal<number | null>(null);

  protected readonly formattedTotalTime = computed(() => {
    const total = this.report()?.totalTimeSeconds ?? 0;
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  protected readonly formattedAvgTimeCorrect = computed(() => {
    const v = this.report()?.avgTimeCorrectAnswersSeconds ?? 0;
    return `${Math.floor(v / 60)}:${Math.round(v % 60).toString().padStart(2, '0')}`;
  });

  protected readonly formattedAvgTimeIncorrect = computed(() => {
    const v = this.report()?.avgTimeIncorrectAnswersSeconds ?? 0;
    return `${Math.floor(v / 60)}:${Math.round(v % 60).toString().padStart(2, '0')}`;
  });

  protected readonly formattedMinTime = computed(() => {
    const v = this.report()?.minTimeSeconds ?? 0;
    return `${Math.floor(v / 60)}:${Math.round(v % 60).toString().padStart(2, '0')}`;
  });

  protected readonly formattedMaxTime = computed(() => {
    const v = this.report()?.maxTimeSeconds ?? 0;
    return `${Math.floor(v / 60)}:${Math.round(v % 60).toString().padStart(2, '0')}`;
  });

  protected readonly recommendations = computed(() => {
    const raw = this.report()?.recommendations ?? '';
    if (!raw) return '';
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'string') return parsed;
      if (Array.isArray(parsed)) return parsed.join('\n');
      if (typeof parsed === 'object') return Object.values(parsed).join('\n');
      return raw;
    } catch {
      return raw;
    }
  });

  ngOnInit() {
    if (!this.attemptId) {
      this.loading.set(false);
      this.error.set(true);
      return;
    }
    this.examProgress.loadProgress(this.attemptId).subscribe();
    this.examService.getExamReport(this.attemptId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.report.set(res.data);
        } else {
          this.error.set(true);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
    this.fetchQuestions(1);
  }

  private fetchQuestions(page: number) {
    this.questionsLoading.set(true);
    const statusParam = this.activeFilter() === 'All' ? undefined : this.activeFilter();
    this.examService.getPaginatedQuestions(this.attemptId, page, this.pageSize, statusParam).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.questions.set(res.data.items);
          this.totalCount.set(res.data.totalCount);
          this.totalPages.set(res.data.totalPages);
          this.currentPage.set(res.data.currentPage);
          this.expandedQuestions.set(new Set());
        } else {
          this.questions.set([]);
        }
        this.questionsLoading.set(false);
      },
      error: () => {
        this.questionsLoading.set(false);
      },
    });
  }

  protected setFilter(filter: string) {
    if (this.activeFilter() !== filter && (filter === 'All' || filter === 'Incorrect' || filter === 'Flagged')) {
      this.activeFilter.set(filter);
      this.fetchQuestions(1);
    }
  }

  protected goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.fetchQuestions(page);
    }
  }

  protected navigateToQuestion(qIndex: number) {
    const page = Math.ceil(qIndex / this.pageSize);
    if (page !== this.currentPage()) {
      this.fetchQuestions(page);
    }
    const q = this.questions().find((x) => x.orderIndex === qIndex);
    if (q) {
      this.toggleQuestion(qIndex);
    }
  }

  protected toggleQuestion(index: number) {
    this.activeQuestionIndex.set(index);
    this.expandedQuestions.update((s) => {
      const next = new Set(s);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  protected isExpanded(index: number): boolean {
    return this.expandedQuestions().has(index);
  }

  protected scoreColor(score: number): string {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  }

  protected scoreBarColor(score: number) {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  }

  protected passFailColor(passed: boolean): string {
    return passed ? 'text-emerald-700' : 'text-red-700';
  }

  protected cleanQuestionBody(body: string): string {
    return body.replace(/<ol[^>]*>[\s\S]*?<\/ol>/gi, '').replace(/<li[^>]*>[\s\S]*?<\/li>/gi, '');
  }

  protected difficultyLabel(level: number): string {
    if (level === 1) return 'Easy';
    if (level === 2) return 'Medium';
    if (level === 3) return 'Hard';
    return `Level ${level}`;
  }

  protected difficultyColor(level: number): string {
    if (level === 1) return 'bg-emerald-100 text-emerald-700';
    if (level === 2) return 'bg-amber-100 text-amber-700';
    if (level === 3) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-600';
  }
}
