export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: LoginUserDto;
}

export interface LoginUserDto {
  userId: string;
  email: string;
  firstName: string;
  role: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: number;
  specialization?: string;
  certificationTarget?: string;
  country?: string;
}

export interface RegisterResponseDto {
  userId: string;
  candidateId: string;
  email: string;
  firstName: string;
  role: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LogoutRequestDto {
  refreshToken: string;
}

export interface RegisterExpertRequestDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  expertiseAreas: string;
  qualifications: string;
}

export interface RegisterExpertResponseDto {
  userId: string;
  expertId: string;
  email: string;
  isVerified: boolean;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  email: string;
  token: string;
  newPassword: string;
}
