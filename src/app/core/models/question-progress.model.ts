export interface QuestionProgressDto {
  attemptQuestionId: string;
  orderIndex: number;
  status: 'Correct' | 'Incorrect' | 'Unanswered' | 'Answered';
  isFlagged: boolean;
}
