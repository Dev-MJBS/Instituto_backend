import {
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
  IsEnum,
  IsDateString,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubmissionArea } from '@prisma/client';

export class CreateArticleDto {
  @ApiProperty()
  @IsUUID()
  edition_id!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  title!: string;

  @ApiProperty()
  @IsString()
  abstract!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  keywords!: string[];

  @ApiProperty({ enum: SubmissionArea })
  @IsEnum(SubmissionArea)
  area!: SubmissionArea;

  @ApiProperty({
    description: 'Array of { name, institution, email }',
    example: [{ name: 'João Silva', institution: 'UFSP', email: 'joao@ufsp.edu.br' }],
  })
  authors!: object[];

  @ApiProperty({ example: 'https://cdn.institutojob.com.br/articles/artigo1.pdf' })
  @IsString()
  file_url!: string;

  @ApiPropertyOptional({ example: '10.1234/rcbc.2026.001' })
  @IsOptional()
  @IsString()
  doi?: string;

  @ApiPropertyOptional({ example: '14-28' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  pages?: string;

  @ApiProperty({ example: '2026-07-15' })
  @IsDateString()
  published_at!: string;
}

export class UpdateArticleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  doi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  pages?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;
}

export class QueryAdminContactsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number;
}
