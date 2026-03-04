import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EditionStatus } from '@prisma/client';

type EditionStatusLabel = 'Recebendo submissões' | 'Publicada' | 'Em revisão' | 'Encerrada';

function mapStatusLabel(status: EditionStatus): EditionStatusLabel {
  const labels: Record<EditionStatus, EditionStatusLabel> = {
    open: 'Recebendo submissões',
    published: 'Publicada',
    in_review: 'Em revisão',
    closed: 'Encerrada',
  };
  return labels[status];
}

@Injectable()
export class EditionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findCurrent() {
    const edition = await this.prisma.edition.findFirst({
      where: { status: { in: ['open', 'published'] } },
      orderBy: [{ volume: 'desc' }, { number: 'desc' }],
    });

    if (!edition) {
      throw new NotFoundException('Nenhuma edição ativa encontrada.');
    }

    return {
      id: edition.id,
      volume: edition.volume,
      number: edition.number,
      year: edition.year,
      status: mapStatusLabel(edition.status),
      focus: edition.focus,
      deadline: edition.deadline ? edition.deadline.toISOString().split('T')[0] : null,
    };
  }

  async findAll() {
    const editions = await this.prisma.edition.findMany({
      where: { status: 'published' },
      orderBy: [{ volume: 'desc' }, { number: 'desc' }],
    });

    return editions.map((e) => ({
      id: e.id,
      volume: e.volume,
      number: e.number,
      year: e.year,
      status: mapStatusLabel(e.status),
      focus: e.focus,
      publishedAt: e.publishedAt ? e.publishedAt.toISOString().split('T')[0] : null,
    }));
  }
}
