import { Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TopicService } from '../../../../core/services/topic.service';
import { TestBankService } from '../../../../core/services/test-bank.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import type { TestBankDto } from '../../../../core/models/exam.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-topic-create',
  standalone: true,
  imports: [RouterLink, SpinnerComponent],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="px-6 py-5 border-b border-gray-100">
          <h1 class="text-xl font-bold text-gray-900">Create Topic</h1>
          @if (selectedBankName()) {
            <p class="text-sm text-gray-500 mt-1">Test Bank: {{ selectedBankName() }}</p>
          }
        </div>

        <div class="px-6 py-5 space-y-5">
          @if (testBanks().length > 1) {
            <div>
              <label class="form-label" for="testBank">Test Bank</label>
              <select id="testBank" class="form-input" [value]="selectedBankId()" (change)="onBankChange($event)">
                <option value="">Select a test bank...</option>
                @for (bank of testBanks(); track bank.id) {
                  <option [value]="bank.id">{{ bank.name }}</option>
                }
              </select>
            </div>
          }

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

        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex items-center justify-end gap-3">
          <a routerLink="/expert/topics" class="btn px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Cancel</a>
          <button class="btn px-5 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  [disabled]="!canSave() || saving()" (click)="save()">
            @if (saving()) { <app-spinner size="sm" color="neutral" /> }
            Create Topic
          </button>
        </div>
      </div>
    </div>
  `,
})
export class TopicCreateComponent {
  private readonly topicService = inject(TopicService);
  private readonly testBankService = inject(TestBankService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly testBanks = signal<TestBankDto[]>([]);
  protected readonly selectedBankId = signal('');
  protected readonly selectedBankName = signal('');
  protected readonly name = signal('');
  protected readonly description = signal('');
  protected readonly saving = signal(false);

  protected readonly canSave = () => !!this.selectedBankId() && !!this.name().trim();

  constructor() {
    const bankId = this.route.snapshot.queryParamMap.get('testBankId');
    this.testBankService.getAll({ pageSize: 100 }).subscribe({
      next: (res) => {
        this.testBanks.set(res.data.items);
        if (bankId && res.data.items.find((b) => b.id === bankId)) {
          this.selectedBankId.set(bankId);
          this.selectedBankName.set(res.data.items.find((b) => b.id === bankId)?.name ?? '');
        }
      },
    });
  }

  protected onBankChange(event: Event) {
    const id = (event.target as any).value;
    this.selectedBankId.set(id);
    this.selectedBankName.set(this.testBanks().find((b) => b.id === id)?.name ?? '');
  }

  protected save() {
    if (!this.canSave() || this.saving()) return;
    this.saving.set(true);
    this.topicService.create(this.selectedBankId(), {
      name: this.name().trim(),
      description: this.description().trim(),
    }).subscribe({
      next: () => {
        this.toast.success('Topic created');
        this.router.navigate(['/expert/topics']);
      },
      error: () => {
        this.toast.error('Failed to create topic');
        this.saving.set(false);
      },
    });
  }
}
