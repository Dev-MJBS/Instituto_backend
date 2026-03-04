import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@ApiTags('Contact')
@UseGuards(ThrottlerGuard)
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 3600000, limit: 5 } }) // 5 per hour per IP
  @ApiOperation({ summary: 'Enviar mensagem de contato' })
  @ApiResponse({ status: 200, description: 'Mensagem recebida com sucesso.' })
  @ApiResponse({ status: 422, description: 'Dados de entrada inválidos.' })
  @ApiResponse({ status: 429, description: 'Muitas requisições. Tente novamente em breve.' })
  async create(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }
}
