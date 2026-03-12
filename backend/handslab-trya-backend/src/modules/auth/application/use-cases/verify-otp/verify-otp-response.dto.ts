export class VerifyOtpResponseDto {
  isValid: boolean;
  message: string;
  expiresAt?: string;
  type?: string;
}
