import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { pdfUploadConfig } from './multer.config';

@ApiTags('Submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', pdfUploadConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Submeter artigo para a RCBC' })
  @ApiBody({
    description: 'Dados da submissão + arquivo PDF',
    type: CreateSubmissionDto,
  })
  @ApiResponse({ status: 201, description: 'Submissão recebida.' })
  @ApiResponse({ status: 422, description: 'Dados inválidos.' })
  async create(
    @Body() dto: CreateSubmissionDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('O arquivo PDF é obrigatório.');
    }
    return this.submissionsService.create(dto, file);
  }
}
