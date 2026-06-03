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
