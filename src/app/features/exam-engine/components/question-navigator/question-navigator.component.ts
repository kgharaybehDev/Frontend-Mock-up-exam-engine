import { Component, computed, inject, input, output } from '@angular/core';
import { ExamProgressService } from '../../../../core/services/exam-progress.service';
import { QuestionStatusPipe } from '../../../../shared/pipes/question-status.pipe';

@Component({
  selector: 'app-question-navigator',
  standalone: true,
  imports: [QuestionStatusPipe],
  templateUrl: './question-navigator.component.html',
})
export class QuestionNavigatorComponent {
  private readonly examProgress = inject(ExamProgressService);

  readonly currentIndex = input(0);

  readonly navigate = output<number>();

  readonly navItems = computed(() =>
    this.examProgress.progressItems().map((item, index) => {
      const isCurrent = index === this.currentIndex();
      const isFlagged = item.isFlagged;
      let style: 'correct' | 'incorrect' | 'unanswered' | 'answered' | 'current' = 'unanswered';
      if (isCurrent) style = 'current';
      else if (item.status === 'Correct') style = 'correct';
      else if (item.status === 'Incorrect') style = 'incorrect';
      else if (item.status !== 'Unanswered') style = 'answered';
      return { index, style, isCurrent, isFlagged };
    })
  );

  protected btnClass(item: { style: string; isCurrent: boolean }): string {
    const base = 'relative w-full h-full rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 min-h-[44px] min-w-[44px]';
    const map: Record<string, string> = {
      current: 'bg-blue-600 text-white ring-2 ring-blue-600',
      correct: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
      incorrect: 'bg-red-50 text-red-700 border border-red-300',
      answered: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
      unanswered: 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200',
    };
    return `${base} ${map[item.style] || map['unanswered']}`;
  }

  navigateTo(index: number) {
    this.navigate.emit(index);
  }
}
