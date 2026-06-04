import { Component, input, output } from '@angular/core';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';
import type { ExamSessionQuestion } from '../../../../core/services/exam.service';

@Component({
  selector: 'app-question-card',
  standalone: true,
  imports: [SafeHtmlPipe],
  templateUrl: './question-card.component.html',
})
export class QuestionCardComponent {
  readonly question = input.required<ExamSessionQuestion>();
  readonly answer = input<string>('');
  readonly questionNumber = input(0);

  readonly answerChange = output<string>();

  private readonly inputId = crypto.randomUUID();

  protected readonly textareaId = `${this.inputId}-textarea`;

  onInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.answerChange.emit(value);
  }
}
