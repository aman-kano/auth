import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'aman.kanojiya@drone-management.com',
    description: 'The email address of the user'
  })
  @IsEmail()
  email: string;
}
