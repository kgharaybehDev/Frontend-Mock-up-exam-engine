import type { UserManagementDto } from './user.model';

export interface AuditLogDto {
  id: string;
  userId: string;
  userEmail: string;
  actionType: string;
  entityType: string;
  entityId: string;
  oldValues: string;
  newValues: string;
  ipAddress: string;
  createdAt: string;
}

export interface NotificationDto {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  sentAt: string;
  readAt: string;
}

export interface SendNotificationDto {
  targetType: number;
  targetId: string;
  type: number;
  message: string;
}

export type { UserManagementDto };

export interface TestBankListItemDto {
  id: string;
  name: string;
  country: string;
  certificationType: string;
  description: string;
  isActive: boolean;
}

export interface TopicListItemDto {
  id: string;
  testBankId: string;
  name: string;
  description: string;
  isActive: boolean;
  totalQuestions: number;
}

export interface CreateTestBankDto {
  name: string;
  country: string;
  certificationType: string;
  description: string;
}

export interface CreateTopicDto {
  testBankId: string;
  name: string;
  description: string;
}

export interface QuestionOptionDto {
  optionLetter: string;
  optionText: string;
  isCorrect: boolean;
  displayOrder: number;
}

export interface AdminCreateQuestionDto {
  topicId: string;
  body: string;
  difficultyLevel: number;
  explanation: string;
  correctAnswer: string;
  options: QuestionOptionDto[];
}

export interface AdminQuestionListItemDto {
  id: string;
  topicId: string;
  topicName: string;
  body: string;
  difficultyLevel: number;
  isActive: boolean;
  correctAnswer: string;
  options: QuestionOptionDto[];
  createdAt: string;
}

export interface AdminQuestionDetailDto {
  id: string;
  topicId: string;
  topicName: string;
  body: string;
  difficultyLevel: number;
  isActive: boolean;
  explanation: string;
  correctAnswer: string;
  options: QuestionOptionDto[];
  createdAt: string;
}
