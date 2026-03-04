import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  QueryAdminSubmissionsDto,
  UpdateSubmissionStatusDto,
} from './dto/admin-submissions.dto';
import { CreateEditionDto, UpdateEditionDto } from './dto/admin-editions.dto';
import { CreateArticleDto, UpdateArticleDto } from './dto/admin-articles.dto';
import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class UpdateContactDto {
  @ApiProperty()
  @IsBoolean()
  read!: boolean;
}

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'editor')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Submissions ────────────────────────────────────────────────────────────

  @Get('submissions')
  @ApiOperation({ summary: '[Admin] Listar submissões' })
  listSubmissions(@Query() query: QueryAdminSubmissionsDto) {
    return this.adminService.listSubmissions(query);
  }

  @Get('submissions/:id')
  @ApiOperation({ summary: '[Admin] Detalhe de uma submissão' })
  @ApiParam({ name: 'id', type: String })
  getSubmission(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getSubmission(id);
  }

  @Patch('submissions/:id')
  @ApiOperation({ summary: '[Admin] Atualizar status/notas de submissão' })
  @ApiParam({ name: 'id', type: String })
  updateSubmission(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubmissionStatusDto,
  ) {
    return this.adminService.updateSubmission(id, dto);
  }

  // ─── Editions ───────────────────────────────────────────────────────────────

  @Post('editions')
  @ApiOperation({ summary: '[Admin] Criar nova edição' })
  @ApiResponse({ status: 201 })
  createEdition(@Body() dto: CreateEditionDto) {
    return this.adminService.createEdition(dto);
  }

  @Patch('editions/:id')
  @ApiOperation({ summary: '[Admin] Atualizar edição' })
  @ApiParam({ name: 'id', type: String })
  updateEdition(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEditionDto,
  ) {
    return this.adminService.updateEdition(id, dto);
  }

  @Delete('editions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Deletar edição (somente admin)' })
  @ApiParam({ name: 'id', type: String })
  deleteEdition(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteEdition(id);
  }

  // ─── Articles ───────────────────────────────────────────────────────────────

  @Post('articles')
  @ApiOperation({ summary: '[Admin] Publicar artigo' })
  createArticle(@Body() dto: CreateArticleDto) {
    return this.adminService.createArticle(dto);
  }

  @Patch('articles/:id')
  @ApiOperation({ summary: '[Admin] Atualizar artigo' })
  @ApiParam({ name: 'id', type: String })
  updateArticle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateArticleDto,
  ) {
    return this.adminService.updateArticle(id, dto);
  }

  @Delete('articles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Deletar artigo (somente admin)' })
  @ApiParam({ name: 'id', type: String })
  deleteArticle(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteArticle(id);
  }

  // ─── Contacts ───────────────────────────────────────────────────────────────

  @Get('contacts')
  @ApiOperation({ summary: '[Admin] Listar mensagens de contato' })
  listContacts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.listContacts(Number(page) || 1, Number(limit) || 20);
  }

  @Patch('contacts/:id')
  @ApiOperation({ summary: '[Admin] Marcar contato como lido/não lido' })
  @ApiParam({ name: 'id', type: String })
  updateContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.adminService.updateContact(id, dto.read);
  }
}
