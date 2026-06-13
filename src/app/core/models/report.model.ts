import type { AttemptAttachmentDto } from './attempt.model';

export interface QuestionOptionDto {
  optionLetter: string;
  optionText: string;
  displayOrder: number;
}

export interface TopicBreakdownDto {
  topicName: string;
  scorePercent: number;
  totalQuestions: number;
  correctCount: number;
}

export interface DifficultyBreakdownDto {
  level: number;
  levelName: string;
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
}

export interface QuestionDetailDto {
  attemptQuestionId: string;
  orderIndex: number;
  questionBody: string;
  questionType: string;
  options: QuestionOptionDto[];
  yourAnswer: string;
  correctAnswer: string;
  timeSpentSeconds: number;
  isFlagged: boolean;
  isCorrect: boolean;
  topicName: string;
  explanation: string;
  difficultyLevel: number;
  attachments: AttemptAttachmentDto[];
}

export interface ExamReportDto {
  attemptId: string;
  examTitle: string;
  score: number;
  passed: boolean;
  totalTimeSeconds: number;
  startedAt: string;
  minTimeSeconds: number;
  maxTimeSeconds: number;
  avgTimeSeconds: number;
  avgTimeCorrectAnswersSeconds: number;
  avgTimeIncorrectAnswersSeconds: number;
  totalFlaggedCount: number;
  totalQuestions: number;
  recommendations: string;
  topicBreakdowns: TopicBreakdownDto[];
  difficultyBreakdowns: DifficultyBreakdownDto[];
}

export interface QuestionPageDto {
  items: QuestionDetailDto[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
