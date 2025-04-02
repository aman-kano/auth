import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Reset token received via email',
    example: 'abc123...',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'New password',
    example: 'newSecurePassword123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
} 