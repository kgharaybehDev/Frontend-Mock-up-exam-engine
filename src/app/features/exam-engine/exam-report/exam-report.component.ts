import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
  selector: 'app-exam-report',
  standalone: true,
  imports: [RouterLink, CardComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <app-card class="max-w-lg w-full text-center" title="Detailed Report">
        <div class="py-8 space-y-4">
          <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" aria-hidden="true"></div>
          <p class="text-gray-600">Detailed Report Loading...</p>
          <p class="text-sm text-gray-400">Report ID: {{ attemptId }}</p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3" card-footer>
          <a routerLink="/candidate/dashboard" class="btn btn-full">
            Back to Dashboard
          </a>
        </div>
      </app-card>
    </div>
  `,
})
export class ExamReportComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly attemptId = this.route.snapshot.paramMap.get('id') ?? '';
}
