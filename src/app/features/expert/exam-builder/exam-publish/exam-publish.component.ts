import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-exam-publish',
  standalone: true,
  imports: [RouterLink, SpinnerComponent],
  template: `
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center gap-3 text-sm text-gray-500 mb-4">
        <a routerLink="/expert/dashboard" class="hover:text-blue-600">Dashboard</a>
        <span>/</span>
        <span class="text-gray-900 font-medium">Publish Exam</span>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="px-6 py-5 border-b border-gray-100">
          <h1 class="text-xl font-bold text-gray-900">Publish Exam</h1>
          <p class="text-sm text-gray-500 mt-1">Review and publish the exam for candidates.</p>
        </div>

        <div class="px-6 py-5 space-y-6">
          <div class="flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <svg class="h-5 w-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p class="text-sm text-amber-800">
              Publishing will make this exam available to candidates. Ensure all details are correct before proceeding.
            </p>
          </div>

          <div class="space-y-4">
            <h2 class="text-lg font-semibold text-gray-900">Exam Summary</h2>

            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 rounded-lg bg-gray-50">
                <p class="text-xs font-medium text-gray-500 uppercase">Duration</p>
                <p class="text-sm font-semibold text-gray-900 mt-1">{{ examData.durationMinutes }} minutes</p>
              </div>
              <div class="p-4 rounded-lg bg-gray-50">
                <p class="text-xs font-medium text-gray-500 uppercase">Pass Score</p>
                <p class="text-sm font-semibold text-gray-900 mt-1">{{ examData.passScore }}%</p>
              </div>
              <div class="p-4 rounded-lg bg-gray-50">
                <p class="text-xs font-medium text-gray-500 uppercase">Price</p>
                <p class="text-sm font-semibold text-gray-900 mt-1">{{ examData.price > 0 ? '$' + examData.price : 'Free' }}</p>
              </div>
              <div class="p-4 rounded-lg bg-gray-50">
                <p class="text-xs font-medium text-gray-500 uppercase">Status</p>
                <p class="text-sm font-semibold mt-1" [class.text-amber-600]="true">Draft</p>
              </div>
            </div>

            <div class="p-4 rounded-lg bg-gray-50">
              <p class="text-xs font-medium text-gray-500 uppercase">Composition Topics</p>
              <div class="mt-2 space-y-1">
                @for (comp of examData.compositions; track comp.topicId) {
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-700">{{ comp.topicName }}</span>
                    <span class="text-gray-500">{{ comp.questionCount }} questions</span>
                  </div>
                } @empty {
                  <p class="text-sm text-gray-500">No topics configured.</p>
                }
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex items-center justify-between">
          <a routerLink="/expert/dashboard" class="btn px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
            &larr; Back
          </a>
          <div class="flex items-center gap-3">
            <a routerLink="/expert/dashboard" class="btn px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Save as Draft
            </a>
            <button class="btn px-5 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    [disabled]="publishing()" (click)="publish()">
              @if (publishing()) { <app-spinner size="sm" color="neutral" /> }
              Publish Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ExamPublishComponent {
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly publishing = signal(false);

  protected readonly examData = {
    durationMinutes: 60,
    passScore: 70,
    price: 0,
    compositions: [
      { topicId: '1', topicName: 'Sample Topic', questionCount: 10 },
    ],
  };

  protected publish() {
    this.publishing.set(true);
    setTimeout(() => {
      this.toast.success('Exam published successfully');
      this.publishing.set(false);
      this.router.navigate(['/expert/dashboard']);
    }, 1000);
  }
}
