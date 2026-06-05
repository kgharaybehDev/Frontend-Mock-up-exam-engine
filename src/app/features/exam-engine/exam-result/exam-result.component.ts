import { Component, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ExamService } from '../../../core/services/exam.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-exam-result',
  standalone: true,
  imports: [RouterLink, CardComponent, ButtonComponent],
  templateUrl: './exam-result.component.html',
})
export class ExamResultComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly examService = inject(ExamService);

  readonly result = this.examService.submitResult;
  readonly session = this.examService.session;

  readonly attemptId = computed(() => this.result()?.attemptId ?? '');

  readonly passed = computed(() => this.result()?.passed ?? false);
  readonly score = computed(() => this.result()?.score ?? 0);
  readonly totalTimeSeconds = computed(() => this.result()?.totalTimeSeconds ?? 0);
  readonly reportStatus = computed(() => this.result()?.reportStatus ?? '');
  readonly reportUrl = computed(() => this.result()?.reportUrl ?? '');
  readonly message = computed(() => this.result()?.message ?? '');
  readonly examTitle = computed(() => this.session()?.examTitle ?? 'Exam');

  readonly reportError = signal(false);

  private pollTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    if (this.attemptId()) {
      if (this.reportStatus() !== 'generating') {
        this.router.navigate(['/exam/report', this.attemptId()]);
        return;
      }
      this.pollTimer = setInterval(() => {
        this.examService.checkReport(this.attemptId()).subscribe({
          next: (res) => {
            if (res.success) {
              this.stopPolling();
              this.router.navigate(['/exam/report', this.attemptId()]);
            }
          },
          error: () => {
            this.reportError.set(true);
            this.stopPolling();
          },
        });
      }, 5000);
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  private stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  protected readonly formattedTime = computed(() => {
    const total = this.totalTimeSeconds();
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });
}
