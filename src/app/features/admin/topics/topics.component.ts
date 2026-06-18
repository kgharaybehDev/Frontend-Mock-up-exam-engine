import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TopicService } from '../../../core/services/topic.service';
import { TestBankService } from '../../../core/services/test-bank.service';

@Component({
  selector: 'app-topics',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a routerLink="/admin/testbanks" class="text-sm text-blue-600 hover:text-blue-800">&larr; Test Banks</a>
          <h1 class="text-2xl font-bold text-gray-900">Topics</h1>
        </div>
        <button type="button" class="btn btn-full w-auto" (click)="showCreate = true">+ New Topic</button>
      </div>

      @if (showCreate) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
          <input
            #nameInput
            placeholder="Topic Name"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea #descInput placeholder="Description" rows="2" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          <div class="flex gap-2 justify-end">
            <button type="button" class="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50" (click)="showCreate = false">Cancel</button>
            <button type="button" class="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700" (click)="createTopic(nameInput, descInput)">Create</button>
          </div>
        </div>
      }

      @if (editTopic(); as et) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
          <input
            #editNameInput
            [value]="et.name"
            placeholder="Topic Name"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea #editDescInput placeholder="Description" rows="2" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">{{ et.description }}</textarea>
          <div class="flex gap-2 justify-end">
            <button type="button" class="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50" (click)="editTopic.set(null)">Cancel</button>
            <button type="button" class="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700" (click)="saveEdit(et.id, editNameInput, editDescInput)">Save</button>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="text-center py-12 text-gray-400">Loading topics...</div>
      } @else if (error()) {
        <div class="text-center py-12 text-red-500">{{ error() }}</div>
      } @else {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
          @for (topic of topics(); track topic.id) {
            <div class="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors" [class.opacity-60]="!topic.isActive">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <a [routerLink]="['/admin/testbanks', testBankId(), 'topics', topic.id, 'questions']" class="text-sm font-semibold text-blue-600 hover:text-blue-800 truncate">{{ topic.name }}</a>
                  @if (!topic.isActive) {
                    <span class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Inactive</span>
                  }
                </div>
                <p class="text-xs text-gray-500 mt-0.5">{{ topic.description || 'No description' }} · {{ topic.totalQuestions }} questions</p>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" class="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1" (click)="startEdit(topic)">Edit</button>
                <button
                  type="button"
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [class.bg-blue-600]="topic.isActive"
                  [class.bg-gray-200]="!topic.isActive"
                  (click)="toggleActive(topic)"
                >
                  <span class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform" [class.translate-x-5]="topic.isActive" [class.translate-x-0]="!topic.isActive"></span>
                </button>
              </div>
            </div>
          } @empty {
            <div class="px-5 py-12 text-center text-sm text-gray-400">No topics found for this test bank.</div>
          }
        </div>
      }
    </div>
  `,
})
export class TopicsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly topicService = inject(TopicService);

  protected readonly testBankId = signal('');
  protected readonly topics = signal<any[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected showCreate = false;
  protected readonly editTopic = signal<any | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('testBankId');
    if (id) {
      this.testBankId.set(id);
      this.loadTopics(id);
    }
  }

  private loadTopics(testBankId: string) {
    this.loading.set(true);
    this.topicService.getByTestBank(testBankId).subscribe({
      next: (res: any) => { this.topics.set(res.data ?? []); this.loading.set(false); },
      error: () => { this.error.set('Failed to load topics.'); this.loading.set(false); },
    });
  }

  protected createTopic(name: HTMLInputElement, desc: HTMLTextAreaElement) {
    const nameVal = name.value.trim();
    if (!nameVal) return;
    this.topicService.create(this.testBankId(), { name: nameVal, description: desc.value.trim() }).subscribe({
      next: () => { this.showCreate = false; this.loadTopics(this.testBankId()); },
    });
  }

  protected startEdit(topic: any) {
    this.editTopic.set(topic);
  }

  protected saveEdit(id: string, name: HTMLInputElement, desc: HTMLTextAreaElement) {
    const nameVal = name.value.trim();
    if (!nameVal) return;
    this.topicService.update(this.testBankId(), id, { name: nameVal, description: desc.value.trim() }).subscribe({
      next: () => { this.editTopic.set(null); this.loadTopics(this.testBankId()); },
    });
  }

  protected toggleActive(topic: any) {
    this.topicService.toggleActive(topic.id).subscribe({ next: () => this.loadTopics(this.testBankId()) });
  }
}
