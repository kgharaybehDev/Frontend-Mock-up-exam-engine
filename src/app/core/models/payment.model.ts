export interface PaymentDto {
  paymentId: string;
  examId: string;
  examTitle: string;
  amount: number;
  discountApplied: number;
  currency: string;
  status: string;
  couponCode: string;
  paidAt: string;
}

export interface PaymentInitRequestDto {
  examId: string;
  couponCode: string;
  currency: string;
}

export interface PaymentInitiateResultDto {
  paymentId: string;
  examId: string;
  examTitle: string;
  originalAmount: number;
  discountApplied: number;
  finalAmount: number;
  currency: string;
  couponCode: string;
  checkoutUrl: string;
  hyperpayCheckoutId: string;
  paymentStatus: string;
}

export interface CouponDto {
  id: string;
  code: string;
  description: string;
  discountType: number;
  discountValue: number;
  maxTotalUses: number;
  maxUsesPerCandidate: number;
  currentUsageCount: number;
  remainingUses: number;
  expiresAt: string;
  isExpired: boolean;
  isExhausted: boolean;
  applicability: CouponApplicabilityInfo[];
  createdAt: string;
}

export interface CouponApplicabilityInfo {
  targetType: string;
  targetId: string;
}

export interface CreateCouponDto {
  code: string;
  description: string;
  discountType: number;
  discountValue: number;
  maxTotalUses: number;
  maxUsesPerCandidate: number;
  expiresAt: string;
  applicability: CouponApplicabilityItem[];
}

export interface CouponApplicabilityItem {
  targetType: number;
  targetId: string;
}

export interface CouponValidateRequestDto {
  couponCode: string;
  examId: string;
}

export interface CouponValidateResultDto {
  isValid: boolean;
  reason: string;
  couponCode: string;
  discountType: string;
  discountValue: number;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  currency: string;
}
