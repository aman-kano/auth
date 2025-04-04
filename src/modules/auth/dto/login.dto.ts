import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'aman.kanojiya@drone-management.com',
    description: 'The email address of the user'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Aman@123',
    description: 'The password of the user',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  password: string;
} 