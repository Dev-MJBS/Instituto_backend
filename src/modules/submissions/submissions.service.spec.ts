import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsService } from './submissions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { BadRequestException } from '@nestjs/common';
import { Readable } from 'stream';
import { SubmissionArea } from './dto/create-submission.dto';

const mockPrismaService = {
  submission: {
    create: jest.fn(),
  },
};

const mockEmailService = {
  sendSubmissionConfirmation: jest.fn(),
  sendSubmissionNotification: jest.fn(),
};

function createMockFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'artigo.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1024 * 1024, // 1MB
    buffer: Buffer.from(''),
    path: '/uploads/submissions/test.pdf',
    destination: '/uploads/submissions',
    filename: 'test.pdf',
    stream: new Readable(),
    ...overrides,
  };
}

describe('SubmissionsService', () => {
  let service: SubmissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const validDto = {
      author_name: 'Dr. João da Silva',
      author_email: 'joao@universidade.edu.br',
      author_institution: 'UFSP',
      author_bio: 'Professor Doutor em Educação com foco em metodologias ativas.',
      title: 'Educação e Formação Humana',
      abstract: 'Este artigo investiga os fundamentos filosóficos da educação integral.',
      keywords: ['educação', 'filosofia', 'formação'],
      area: SubmissionArea.education,
    };

    it('should create a submission successfully', async () => {
      mockPrismaService.submission.create.mockResolvedValue({
        id: 'uuid-submission-1',
        protocol: 'IJB-2026-ABCDE',
      });

      const file = createMockFile();
      const result = await service.create(validDto, file);

      expect(result).toHaveProperty('protocol');
      expect(result).toHaveProperty('submission_id');
      expect(mockPrismaService.submission.create).toHaveBeenCalledTimes(1);
    });

    it('should reject non-PDF files', async () => {
      const file = createMockFile({ mimetype: 'image/jpeg' });

      await expect(service.create(validDto, file)).rejects.toThrow(BadRequestException);
    });

    it('should reject abstract longer than 300 words', async () => {
      const longAbstract = Array(305).fill('palavra').join(' ');
      const file = createMockFile();

      await expect(
        service.create({ ...validDto, abstract: longAbstract }, file),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject files larger than MAX_FILE_SIZE_MB', async () => {
      process.env.MAX_FILE_SIZE_MB = '5';
      const file = createMockFile({ size: 6 * 1024 * 1024 }); // 6MB

      await expect(service.create(validDto, file)).rejects.toThrow(BadRequestException);
    });
  });
});
