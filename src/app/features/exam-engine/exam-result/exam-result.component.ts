import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExamService } from '../../../core/services/exam.service';
import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
  selector: 'app-exam-result',
  standalone: true,
  imports: [RouterLink, CardComponent],
  templateUrl: './exam-result.component.html',
})
export class ExamResultComponent {
  private readonly examService = inject(ExamService);

  readonly result = this.examService.submitResult;
  readonly session = this.examService.session;

  readonly passed = computed(() => this.result()?.passed ?? false);
  readonly score = computed(() => this.result()?.score ?? 0);
  readonly totalTimeSeconds = computed(() => this.result()?.totalTimeSeconds ?? 0);
  readonly reportUrl = computed(() => this.result()?.reportUrl ?? '');
  readonly message = computed(() => this.result()?.message ?? '');
  readonly examTitle = computed(() => this.session()?.examTitle ?? 'Exam');

  protected readonly formattedTime = computed(() => {
    const total = this.totalTimeSeconds();
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  });
}
