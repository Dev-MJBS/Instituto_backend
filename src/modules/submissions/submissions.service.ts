import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { v4 as uuidv4 } from 'uuid';

function generateProtocol(): string {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(36).toUpperCase().slice(2, 7);
  return `IJB-${year}-${suffix}`;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  async create(
    dto: CreateSubmissionDto,
    file: Express.Multer.File,
  ): Promise<{ protocol: string; submission_id: string }> {
    // Validate abstract word count (≤ 300 words)
    if (countWords(dto.abstract) > 300) {
      throw new BadRequestException('O resumo deve ter no máximo 300 palavras.');
    }

    // Validate file type
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('O arquivo deve ser um PDF.');
    }

    // Validate file size (5 MB)
    const maxBytes = (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException(
        `O arquivo deve ter no máximo ${process.env.MAX_FILE_SIZE_MB ?? 5} MB.`,
      );
    }

    const protocol = generateProtocol();

    const submission = await this.prisma.submission.create({
      data: {
        id: uuidv4(),
        protocol,
        authorName: dto.author_name,
        authorEmail: dto.author_email,
        authorInstitution: dto.author_institution,
        authorBio: dto.author_bio,
        title: dto.title,
        abstract: dto.abstract,
        keywords: dto.keywords,
        area: dto.area,
        filePath: file.path,
        coverLetter: dto.cover_letter ?? null,
        status: 'pending',
      },
    });

    // Send emails
    await Promise.allSettled([
      this.email.sendSubmissionConfirmation({
        authorName: dto.author_name,
        authorEmail: dto.author_email,
        title: dto.title,
        protocol,
        area: dto.area,
      }),
      this.email.sendSubmissionNotification({
        authorName: dto.author_name,
        authorEmail: dto.author_email,
        title: dto.title,
        protocol,
        area: dto.area,
      }),
    ]);

    this.logger.log(`New submission created: ${protocol}`);

    return { protocol, submission_id: submission.id };
  }
}
