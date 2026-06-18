import { Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TopicService } from '../../../../core/services/topic.service';
import { TestBankService } from '../../../../core/services/test-bank.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import type { TestBankDto, TopicDto } from '../../../../core/models/exam.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-topic-edit',
  standalone: true,
  imports: [SpinnerComponent],
  template: `
    @if (loading()) {
      <div class="flex justify-center py-12"><app-spinner size="lg" /></div>
    } @else {
      <div class="max-w-2xl mx-auto">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="px-6 py-5 border-b border-gray-100">
            <h1 class="text-xl font-bold text-gray-900">Edit Topic</h1>
            <p class="text-sm text-gray-500 mt-1">Test Bank: {{ bankName() }}</p>
          </div>

          <div class="px-6 py-5 space-y-5">
            <div>
              <label class="form-label" for="name">Topic Name</label>
              <input id="name" class="form-input" placeholder="Enter topic name"
                     [value]="name()" (input)="name.set($any($event.target).value)" />
            </div>
            <div>
              <label class="form-label" for="description">Description</label>
              <textarea id="description" class="form-input min-h-[100px]" placeholder="Enter topic description"
                        [value]="description()" (input)="description.set($any($event.target).value)"></textarea>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex items-center justify-between">
            <button class="btn px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                    (click)="deleteTopic()" [disabled]="saving()">
              Delete Topic
            </button>
            <div class="flex items-center gap-3">
              <a routerLink="/expert/topics" class="btn px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Cancel</a>
              <button class="btn px-5 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                      [disabled]="!name().trim() || saving()" (click)="save()">
                @if (saving()) { <app-spinner size="sm" color="neutral" /> }
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class TopicEditComponent {
  private readonly topicService = inject(TopicService);
  private readonly testBankService = inject(TestBankService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly name = signal('');
  protected readonly description = signal('');
  protected readonly bankName = signal('');

  private topicId = '';
  private testBankId = '';

  constructor() {
    this.topicId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.topicId) {
      this.router.navigate(['/expert/topics']);
      return;
    }
    this.loadTopic();
  }

  private loadTopic() {
    this.testBankService.getAll({ pageSize: 100 }).subscribe({
      next: (banks) => {
        for (const bank of banks.data.items) {
          this.topicService.getById(bank.id, this.topicId).subscribe({
            next: (res) => {
              const topic = res.data;
              this.testBankId = topic.testBankId;
              this.name.set(topic.name);
              this.description.set(topic.description);
              this.bankName.set(bank.name);
              this.loading.set(false);
            },
            error: () => {
              this.topicService.getByTestBank(bank.id).subscribe({
                next: (topics) => {
                  const found = topics.data.find((t) => t.id === this.topicId);
                  if (found) {
                    this.testBankId = found.testBankId;
                    this.name.set(found.name);
                    this.description.set(found.description);
                    this.bankName.set(bank.name);
                    this.loading.set(false);
                  }
                },
              });
            },
          });
        }
      },
      error: () => {
        this.toast.error('Failed to load topic');
        this.loading.set(false);
      },
    });
  }

  protected save() {
    if (!this.name().trim() || this.saving()) return;
    this.saving.set(true);
    this.topicService.update(this.testBankId, this.topicId, {
      name: this.name().trim(),
      description: this.description().trim(),
    }).subscribe({
      next: () => {
        this.toast.success('Topic updated');
        this.router.navigate(['/expert/topics']);
      },
      error: () => {
        this.toast.error('Failed to update topic');
        this.saving.set(false);
      },
    });
  }

  protected deleteTopic() {
    if (!confirm('Are you sure you want to delete this topic?')) return;
    this.saving.set(true);
    this.topicService.delete(this.testBankId, this.topicId).subscribe({
      next: () => {
        this.toast.success('Topic deleted');
        this.router.navigate(['/expert/topics']);
      },
      error: () => {
        this.toast.error('Failed to delete topic');
        this.saving.set(false);
      },
    });
  }
}
