import { Component, computed, input, output } from '@angular/core';
import type { ExamSessionQuestion } from '../../../../core/services/exam.service';
import { QuestionStatusPipe } from '../../../../shared/pipes/question-status.pipe';

@Component({
  selector: 'app-question-navigator',
  standalone: true,
  imports: [QuestionStatusPipe],
  templateUrl: './question-navigator.component.html',
})
export class QuestionNavigatorComponent {
  readonly questions = input.required<ExamSessionQuestion[]>();
  readonly currentIndex = input(0);
  readonly answers = input<Record<string, string>>({});

  readonly navigate = output<number>();

  readonly navItems = computed(() =>
    this.questions().map((q, index) => {
      const isCurrent = index === this.currentIndex();
      const isAnswered = !!this.answers()[q.attemptQuestionId];
      const isFlagged = q.isFlagged;
      let status: 'unanswered' | 'answered' | 'flagged' | 'current' = 'unanswered';
      if (isCurrent) status = 'current';
      else if (isFlagged) status = 'flagged';
      else if (isAnswered) status = 'answered';
      return { index, status, isCurrent };
    })
  );

  protected btnClass(status: string): string {
    const base = 'w-full h-full rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 min-h-[44px] min-w-[44px]';
    const map: Record<string, string> = {
      current: 'bg-blue-600 text-white ring-2 ring-blue-600',
      answered: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
      flagged: 'bg-amber-100 text-amber-800 border border-amber-300',
      unanswered: 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200',
    };
    return `${base} ${map[status] || map['unanswered']}`;
  }

  navigateTo(index: number) {
    this.navigate.emit(index);
  }
}
