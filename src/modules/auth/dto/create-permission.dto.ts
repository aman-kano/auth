import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ description: 'The name of the permission' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'The description of the permission' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'The resource this permission applies to' })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({ description: 'The action this permission allows' })
  @IsString()
  @IsNotEmpty()
  action: string;
} 