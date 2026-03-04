import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';

const mockPrismaService = {
  contact: {
    create: jest.fn(),
  },
};

const mockEmailService = {
  sendContactNotification: jest.fn(),
  sendContactConfirmation: jest.fn(),
};

describe('ContactService', () => {
  let service: ContactService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should persist contact and send emails', async () => {
      mockPrismaService.contact.create.mockResolvedValue({ id: 'uuid-1' });
      mockEmailService.sendContactNotification.mockResolvedValue(undefined);
      mockEmailService.sendContactConfirmation.mockResolvedValue(undefined);

      const result = await service.create({
        name: 'Maria Silva',
        email: 'maria@test.com',
        message: 'Gostaria de mais informações sobre os cursos.',
      });

      expect(result).toEqual({ success: true, message: 'Mensagem recebida.' });
      expect(mockPrismaService.contact.create).toHaveBeenCalledWith({
        data: {
          name: 'Maria Silva',
          email: 'maria@test.com',
          message: 'Gostaria de mais informações sobre os cursos.',
        },
      });
      expect(mockEmailService.sendContactNotification).toHaveBeenCalledTimes(1);
      expect(mockEmailService.sendContactConfirmation).toHaveBeenCalledTimes(1);
    });

    it('should still return success if email fails', async () => {
      mockPrismaService.contact.create.mockResolvedValue({ id: 'uuid-2' });
      mockEmailService.sendContactNotification.mockRejectedValue(new Error('SMTP error'));
      mockEmailService.sendContactConfirmation.mockRejectedValue(new Error('SMTP error'));

      const result = await service.create({
        name: 'João Costa',
        email: 'joao@test.com',
        message: 'Mensagem de teste para verificar resiliência.',
      });

      expect(result.success).toBe(true);
    });
  });
});
