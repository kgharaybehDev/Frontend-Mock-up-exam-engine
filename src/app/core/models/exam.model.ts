export interface ExamDto {
  id: string;
  testBankId: string;
  testBankName: string;
  title: string;
  description: string;
  notes: string;
  durationMinutes: number;
  passScore: number;
  navigationType: number;
  status: number;
  price: number;
  compositions: ExamCompositionDto[];
}

export interface ExamCompositionDto {
  topicId: string;
  topicName: string;
  questionCount: number;
}

export interface ExamListItemDto {
  examId: string;
  title: string;
  description: string;
  country: string;
  certificationType: string;
  durationMinutes: number;
  passScore: number;
  navigationType: string;
  price: number;
  currency: string;
  totalQuestions: number;
  isPurchased: boolean;
}

export interface ExamDetailDto {
  examId: string;
  title: string;
  description: string;
  notes: string;
  durationMinutes: number;
  passScore: number;
  navigationType: string;
  price: number;
  currency: string;
  composition: ExamCompositionInfo[];
  isPurchased: boolean;
  candidateAttempts: number;
}

export interface ExamCompositionInfo {
  topicName: string;
  questionCount: number;
}

export interface CreateExamDto {
  testBankId: string;
  title: string;
  description: string;
  notes: string;
  durationMinutes: number;
  passScore: number;
  navigationType: number;
  price: number;
  compositions: CreateExamCompositionItem[];
}

export interface CreateExamCompositionItem {
  topicId: string;
  questionCount: number;
}

export interface QuestionDto {
  id: string;
  topicId: string;
  topicName: string;
  body: string;
  difficultyLevel: number;
  isActive: boolean;
  correctAnswer: string;
  explanation: string;
  attachments: QuestionAttachmentDto[];
}

export interface QuestionAttachmentDto {
  id: string;
  filePathUrl: string;
  fileType: number;
  displayOrder: number;
  altText: string;
  languageCode: string;
}

export interface CreateQuestionDto {
  topicId: string;
  body: string;
  difficultyLevel: number;
  correctAnswer: string;
  explanation: string;
  attachments: QuestionAttachmentDto[];
}

export interface TestBankDto {
  id: string;
  name: string;
  country: string;
  certificationType: string;
  description: string;
  createdBy: string;
  isActive: boolean;
}

export interface TopicDto {
  id: string;
  testBankId: string;
  name: string;
  description: string;
  totalQuestions: number;
  isActive: boolean;
}
