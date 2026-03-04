import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import {
  QueryAdminSubmissionsDto,
  UpdateSubmissionStatusDto,
} from './dto/admin-submissions.dto';
import { CreateEditionDto, UpdateEditionDto } from './dto/admin-editions.dto';
import { CreateArticleDto, UpdateArticleDto } from './dto/admin-articles.dto';
import { SubmissionStatus, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  // ─── Submissions ──────────────────────────────────────────────────────────

  async listSubmissions(query: QueryAdminSubmissionsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SubmissionWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.area) where.area = query.area;

    const [items, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.submission.count({ where }),
    ]);

    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSubmission(id: string) {
    const submission = await this.prisma.submission.findUnique({ where: { id } });
    if (!submission) throw new NotFoundException(`Submissão "${id}" não encontrada.`);
    return submission;
  }

  async updateSubmission(id: string, dto: UpdateSubmissionStatusDto) {
    const submission = await this.prisma.submission.findUnique({ where: { id } });
    if (!submission) throw new NotFoundException(`Submissão "${id}" não encontrada.`);

    const updated = await this.prisma.submission.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status as SubmissionStatus }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });

    // Notify author if status changed
    if (dto.status && dto.status !== submission.status) {
      await this.email.sendStatusUpdate({
        authorName: submission.authorName,
        authorEmail: submission.authorEmail,
        title: submission.title,
        protocol: submission.protocol,
        status: dto.status,
        notes: dto.notes,
      });
    }

    this.logger.log(`Submission ${id} updated: status=${dto.status}`);
    return updated;
  }

  // ─── Editions ─────────────────────────────────────────────────────────────

  async createEdition(dto: CreateEditionDto) {
    return this.prisma.edition.create({
      data: {
        volume: dto.volume,
        number: dto.number,
        year: dto.year,
        focus: dto.focus,
        status: dto.status ?? 'open',
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
      },
    });
  }

  async updateEdition(id: string, dto: UpdateEditionDto) {
    const edition = await this.prisma.edition.findUnique({ where: { id } });
    if (!edition) throw new NotFoundException(`Edição "${id}" não encontrada.`);

    return this.prisma.edition.update({
      where: { id },
      data: {
        ...(dto.focus !== undefined && { focus: dto.focus }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.deadline !== undefined && { deadline: new Date(dto.deadline) }),
        ...(dto.publishedAt !== undefined && { publishedAt: new Date(dto.publishedAt) }),
      },
    });
  }

  async deleteEdition(id: string) {
    const edition = await this.prisma.edition.findUnique({ where: { id } });
    if (!edition) throw new NotFoundException(`Edição "${id}" não encontrada.`);
    await this.prisma.edition.delete({ where: { id } });
    return { success: true };
  }

  // ─── Articles ─────────────────────────────────────────────────────────────

  async createArticle(dto: CreateArticleDto) {
    return this.prisma.article.create({
      data: {
        id: uuidv4(),
        editionId: dto.edition_id,
        title: dto.title,
        abstract: dto.abstract,
        keywords: dto.keywords,
        area: dto.area,
        authors: dto.authors,
        fileUrl: dto.file_url,
        doi: dto.doi ?? null,
        pages: dto.pages ?? null,
        publishedAt: new Date(dto.published_at),
      },
    });
  }

  async updateArticle(id: string, dto: UpdateArticleDto) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new NotFoundException(`Artigo "${id}" não encontrado.`);

    return this.prisma.article.update({
      where: { id },
      data: {
        ...(dto.doi !== undefined && { doi: dto.doi }),
        ...(dto.pages !== undefined && { pages: dto.pages }),
        ...(dto.title !== undefined && { title: dto.title }),
      },
    });
  }

  async deleteArticle(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new NotFoundException(`Artigo "${id}" não encontrado.`);
    await this.prisma.article.delete({ where: { id } });
    return { success: true };
  }

  // ─── Contacts ─────────────────────────────────────────────────────────────

  async listContacts(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.contact.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contact.count(),
    ]);
    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateContact(id: string, read: boolean) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException(`Contato "${id}" não encontrado.`);
    return this.prisma.contact.update({ where: { id }, data: { read } });
  }
}
