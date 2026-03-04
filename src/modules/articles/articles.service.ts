import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryArticlesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ArticleWhereInput = {};
    if (query.edition_id) where.editionId = query.edition_id;
    if (query.area) where.area = query.area as Prisma.EnumSubmissionAreaFilter;

    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: { edition: { select: { volume: true, number: true, year: true } } },
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: { edition: { select: { volume: true, number: true, year: true } } },
    });

    if (!article) {
      throw new NotFoundException(`Artigo com id "${id}" não encontrado.`);
    }

    return article;
  }
}
