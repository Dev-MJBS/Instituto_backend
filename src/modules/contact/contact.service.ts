import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  async create(dto: CreateContactDto): Promise<{ success: boolean; message: string }> {
    // Persist to database
    await this.prisma.contact.create({
      data: {
        name: dto.name,
        email: dto.email,
        message: dto.message,
      },
    });

    // Send emails (non-blocking — failures are logged, not thrown)
    await Promise.allSettled([
      this.email.sendContactNotification(dto),
      this.email.sendContactConfirmation(dto),
    ]);

    return { success: true, message: 'Mensagem recebida.' };
  }
}
