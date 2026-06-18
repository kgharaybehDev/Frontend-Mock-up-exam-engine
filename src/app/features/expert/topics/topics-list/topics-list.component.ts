import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { TestBankService } from '../../../../core/services/test-bank.service';
import { TopicService } from '../../../../core/services/topic.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import type { TestBankDto, TopicDto } from '../../../../core/models/exam.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-topics-list',
  standalone: true,
  imports: [RouterLink, AsyncPipe, SpinnerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Topics</h1>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12"><app-spinner size="lg" /></div>
      } @else {
        <div class="space-y-4">
          @for (bank of testBanks(); track bank.id) {
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                (click)="toggleBank(bank.id)"
              >
                <div>
                  <h3 class="font-semibold text-gray-900">{{ bank.name }}</h3>
                  <p class="text-sm text-gray-500 mt-0.5">{{ bank.country }} &middot; {{ bank.certificationType }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-xs text-gray-400">{{ topicsByBank()[bank.id]?.length ?? 0 }} topics</span>
                  <a [routerLink]="['/expert/topics/new']" [queryParams]="{ testBankId: bank.id }"
                     class="text-sm text-blue-600 hover:text-blue-800 font-medium" (click)="$event.stopPropagation()">
                    + Add Topic
                  </a>
                  <svg class="h-5 w-5 text-gray-400 transition-transform" [class.rotate-180]="expandedBanks().has(bank.id)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              @if (expandedBanks().has(bank.id)) {
                @if (topicLoadingMap()[bank.id]) {
                  <div class="flex justify-center py-6"><app-spinner /></div>
                } @else {
                  @if ((topicsByBank()[bank.id] ?? []).length === 0) {
                    <div class="px-5 py-4 text-sm text-gray-500 border-t border-gray-100">
                      No topics yet. <a [routerLink]="['/expert/topics/new']" [queryParams]="{ testBankId: bank.id }" class="text-blue-600 hover:text-blue-800 font-medium">Create one</a>.
                    </div>
                  } @else {
                    <div class="border-t border-gray-100 divide-y divide-gray-50">
                      @for (topic of topicsByBank()[bank.id] ?? []; track topic.id) {
                        <div class="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                          <a [routerLink]="['/expert/topics', topic.id]" class="flex-1 min-w-0">
                            <span class="text-sm font-medium text-gray-900 hover:text-blue-600">{{ topic.name }}</span>
                            <p class="text-xs text-gray-500 truncate">{{ topic.description }}</p>
                          </a>
                          <div class="flex items-center gap-3 shrink-0">
                            <span class="text-xs text-gray-400">{{ topic.totalQuestions }} questions</span>
                            <a [routerLink]="['/expert/topics', topic.id, 'edit']" class="text-xs text-blue-600 hover:text-blue-800">Edit</a>
                          </div>
                        </div>
                      }
                    </div>
                  }
                }
              }
            </div>
          } @empty {
            <div class="text-center py-12 text-gray-500">
              No test banks available.
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class TopicsListComponent {
  private readonly testBankService = inject(TestBankService);
  private readonly topicService = inject(TopicService);
  private readonly toast = inject(ToastService);

  protected readonly testBanks = signal<TestBankDto[]>([]);
  protected readonly topicsByBank = signal<Record<string, TopicDto[]>>({});
  protected readonly expandedBanks = signal<Set<string>>(new Set());
  protected readonly topicLoadingMap = signal<Record<string, boolean>>({});
  protected readonly loading = signal(true);

  constructor() {
    this.loadTestBanks();
  }

  private loadTestBanks() {
    this.loading.set(true);
    this.testBankService.getAll({ pageSize: 100 }).subscribe({
      next: (res) => {
        this.testBanks.set(res.data.items);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load test banks');
        this.loading.set(false);
      },
    });
  }

  protected toggleBank(bankId: string) {
    const expanded = new Set(this.expandedBanks());
    if (expanded.has(bankId)) {
      expanded.delete(bankId);
      this.expandedBanks.set(expanded);
    } else {
      expanded.add(bankId);
      this.expandedBanks.set(expanded);
      if (!this.topicsByBank()[bankId]) {
        this.loadTopics(bankId);
      }
    }
  }

  private loadTopics(bankId: string) {
    this.topicLoadingMap.update((m) => ({ ...m, [bankId]: true }));
    this.topicService.getByTestBank(bankId).subscribe({
      next: (res) => {
        this.topicsByBank.update((m) => ({ ...m, [bankId]: res.data }));
        this.topicLoadingMap.update((m) => ({ ...m, [bankId]: false }));
      },
      error: () => {
        this.toast.error('Failed to load topics');
        this.topicLoadingMap.update((m) => ({ ...m, [bankId]: false }));
      },
    });
  }
}
