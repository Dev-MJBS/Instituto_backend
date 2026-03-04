import {
  IsInt,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EditionStatus } from '@prisma/client';

export class CreateEditionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  volume!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  number!: number;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2020)
  year!: number;

  @ApiProperty({ example: 'Educação e formação humana', maxLength: 500 })
  @IsString()
  @MaxLength(500)
  focus!: string;

  @ApiPropertyOptional({ enum: EditionStatus, default: 'open' })
  @IsOptional()
  @IsEnum(EditionStatus)
  status?: EditionStatus;

  @ApiPropertyOptional({ example: '2026-06-30' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({ example: '2026-07-15' })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}

export class UpdateEditionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  focus?: string;

  @ApiPropertyOptional({ enum: EditionStatus })
  @IsOptional()
  @IsEnum(EditionStatus)
  status?: EditionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
