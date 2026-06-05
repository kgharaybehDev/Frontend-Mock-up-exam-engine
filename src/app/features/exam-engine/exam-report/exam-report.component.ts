import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ExamService } from '../../../core/services/exam.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import type { ExamReportDto } from '../../../core/models/report.model';

@Component({
  selector: 'app-exam-report',
  standalone: true,
  imports: [RouterLink, DatePipe, CardComponent, ProgressBarComponent],
  templateUrl: './exam-report.component.html',
})
export class ExamReportComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly examService = inject(ExamService);

  protected readonly attemptId = this.route.snapshot.paramMap.get('id') ?? '';

  protected readonly report = signal<ExamReportDto | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly expandedQuestions = signal<Set<number>>(new Set());

  protected readonly formattedTotalTime = computed(() => {
    const total = this.report()?.totalTimeSeconds ?? 0;
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  protected readonly formattedAvgTime = computed(() => {
    const avg = this.report()?.avgTimeSeconds ?? 0;
    const m = Math.floor(avg / 60);
    const s = Math.round(avg % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
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
  }

  protected toggleQuestion(index: number) {
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
}
