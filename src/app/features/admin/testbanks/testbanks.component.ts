import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../../../core/services/admin-api.service';
import type { TestBankListItemDto } from '../../../core/models/admin.model';

@Component({
  selector: 'app-testbanks',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Test Banks</h1>
        <button type="button" class="btn btn-full w-auto" (click)="showCreate = true">+ New Test Bank</button>
      </div>

      @if (showCreate) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
          <input
            #nameInput
            placeholder="Test Bank Name"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div class="flex gap-2">
            <input #countryInput placeholder="Country" class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input #certInput placeholder="Certification Type" class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <textarea #descInput placeholder="Description" rows="2" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          <div class="flex gap-2 justify-end">
            <button type="button" class="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50" (click)="showCreate = false">Cancel</button>
            <button type="button" class="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700" (click)="createTestBank(nameInput, countryInput, certInput, descInput)">Create</button>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="text-center py-12 text-gray-400">Loading test banks...</div>
      } @else if (error()) {
        <div class="text-center py-12 text-red-500">{{ error() }}</div>
      } @else {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
          @for (tb of testbanks(); track tb.id) {
            <div class="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors" [class.opacity-60]="!tb.isActive">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <a [routerLink]="['/admin/testbanks', tb.id, 'topics']" class="text-sm font-semibold text-blue-600 hover:text-blue-800 truncate">{{ tb.name }}</a>
                  @if (!tb.isActive) {
                    <span class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Inactive</span>
                  }
                </div>
                <p class="text-xs text-gray-500 mt-0.5">{{ tb.country }} · {{ tb.certificationType }} · {{ tb.topicCount }} topics · {{ tb.totalQuestions }} questions</p>
              </div>
              <button
                type="button"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                [class.bg-blue-600]="tb.isActive"
                [class.bg-gray-200]="!tb.isActive"
                (click)="toggleActive(tb)"
                [attr.aria-label]="tb.isActive ? 'Deactivate' : 'Activate'"
              >
                <span class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform" [class.translate-x-5]="tb.isActive" [class.translate-x-0]="!tb.isActive"></span>
              </button>
            </div>
          } @empty {
            <div class="px-5 py-12 text-center text-sm text-gray-400">No test banks found.</div>
          }
        </div>
      }
    </div>
  `,
})
export class TestbanksComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);

  protected readonly testbanks = signal<TestBankListItemDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected showCreate = false;

  ngOnInit() {
    this.loadTestBanks();
  }

  private loadTestBanks() {
    this.loading.set(true);
    this.adminApi.getTestBanks().subscribe({
      next: (res) => { this.testbanks.set(res.data?.items ?? []); this.loading.set(false); },
      error: () => { this.error.set('Failed to load test banks.'); this.loading.set(false); },
    });
  }

  protected createTestBank(name: HTMLInputElement, country: HTMLInputElement, cert: HTMLInputElement, desc: HTMLTextAreaElement) {
    const nameVal = name.value.trim();
    if (!nameVal) return;
    this.adminApi.createTestBank({ name: nameVal, country: country.value.trim(), certificationType: cert.value.trim(), description: desc.value.trim() }).subscribe({
      next: () => { this.showCreate = false; this.loadTestBanks(); },
    });
  }

  protected toggleActive(tb: TestBankListItemDto) {
    this.adminApi.toggleTestBank(tb.id).subscribe({ next: () => this.loadTestBanks() });
  }
}
