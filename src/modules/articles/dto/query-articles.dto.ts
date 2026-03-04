import { IsOptional, IsUUID, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SubmissionArea } from '../../submissions/dto/create-submission.dto';

export class QueryArticlesDto {
  @ApiPropertyOptional({ description: 'Filtrar por edição (UUID)' })
  @IsOptional()
  @IsUUID()
  edition_id?: string;

  @ApiPropertyOptional({ enum: SubmissionArea, description: 'Filtrar por área' })
  @IsOptional()
  @IsString()
  area?: string;

  @ApiPropertyOptional({ default: 1, description: 'Página (default: 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, description: 'Resultados por página (default: 10)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
