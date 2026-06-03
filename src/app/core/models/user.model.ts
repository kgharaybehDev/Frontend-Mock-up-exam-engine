export interface UserManagementDto {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  roleName: string;
  accountStatus: number;
  lastLogin: string;
  createdAt: string;
}

export interface UpdateUserStatusDto {
  accountStatus: string;
  reason: string;
}

export interface CandidateDto {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  specialization: string;
  certificationTarget: string;
  country: string;
  createdAt: string;
}

export interface UpdateCandidateDto {
  specialization: string;
  certificationTarget: string;
  country: string;
}

export interface ExpertDto {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  expertiseAreas: string;
  qualifications: string;
  isVerified: boolean;
  createdAt: string;
}
