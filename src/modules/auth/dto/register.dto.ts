import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsPhoneNumber, IsArray } from 'class-validator';
import { UserRole } from '../types/role.enum';

export class RegisterDto {
  @ApiProperty({
    example: 'Aman',
    description: 'The first name of the user'
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Kanojiya',
    description: 'The last name of the user'
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'akanojiya',
    description: 'The username of the user'
  })
  @IsString()
  @MinLength(3)
  username: string;

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

  @ApiProperty({
    example: '+91 9876543210',
    description: 'The phone number of the user'
  })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: '123 Tech Park, Bangalore, India',
    description: 'The address of the user'
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    example: [UserRole.DRONE_OPERATOR],
    description: 'The roles assigned to the user',
    enum: UserRole,
    isArray: true,
    required: false
  })
  @IsArray()
  @IsOptional()
  roles?: UserRole[];
} 