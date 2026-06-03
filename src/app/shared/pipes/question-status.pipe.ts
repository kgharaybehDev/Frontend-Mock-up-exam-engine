import { Pipe, PipeTransform } from '@angular/core';

export type QuestionStatus = 'unanswered' | 'answered' | 'flagged' | 'reviewed' | 'current';

@Pipe({ name: 'questionStatus', standalone: true })
export class QuestionStatusPipe implements PipeTransform {
  transform(value: QuestionStatus): string {
    const labels: Record<QuestionStatus, string> = {
      unanswered: 'Unanswered',
      answered: 'Answered',
      flagged: 'Flagged for Review',
      reviewed: 'Reviewed',
      current: 'Current Question',
    };
    return labels[value] || value;
  }
}
