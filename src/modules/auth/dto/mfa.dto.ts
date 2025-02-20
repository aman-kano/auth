import { IsString, IsNotEmpty } from 'class-validator';

export class MfaVerificationDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  code: string;
} 