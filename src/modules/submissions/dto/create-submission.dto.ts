import {
  IsEmail,
  IsString,
  IsOptional,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SubmissionArea {
  education = 'education',
  philosophy = 'philosophy',
  theology = 'theology',
  culture = 'culture',
}

export class CreateSubmissionDto {
  @ApiProperty({ example: 'Dr. João da Silva' })
  @IsString()
  author_name!: string;

  @ApiProperty({ example: 'joao@universidade.edu.br' })
  @IsEmail()
  author_email!: string;

  @ApiProperty({ example: 'Universidade Federal de São Paulo' })
  @IsString()
  author_institution!: string;

  @ApiProperty({ example: 'Professor Doutor em Educação...', maxLength: 500 })
  @IsString()
  @MaxLength(500)
  author_bio!: string;

  @ApiProperty({ example: 'Educação e Formação Humana Integral' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Este artigo investiga...', description: 'Máximo 300 palavras' })
  @IsString()
  abstract!: string;

  @ApiProperty({
    example: ['educação', 'filosofia', 'formação'],
    description: 'Entre 3 e 6 palavras-chave',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(6)
  @IsString({ each: true })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.split(',').map((k: string) => k.trim());
    }
    return value;
  })
  keywords!: string[];

  @ApiProperty({ enum: SubmissionArea })
  @IsEnum(SubmissionArea)
  area!: SubmissionArea;

  @ApiPropertyOptional({ example: 'Prezados editores, submeto este artigo...' })
  @IsOptional()
  @IsString()
  cover_letter?: string;
}
