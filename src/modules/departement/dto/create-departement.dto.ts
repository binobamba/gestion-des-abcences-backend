import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsPositive } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Développement' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Département de développement logiciel', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'DEV' })
  @IsString()
  code: string;

  @ApiProperty({ example: 500000, required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  budget?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  managerId?: number;
}