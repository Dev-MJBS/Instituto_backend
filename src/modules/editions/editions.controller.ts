import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EditionsService } from './editions.service';

@ApiTags('Editions')
@Controller('editions')
export class EditionsController {
  constructor(private readonly editionsService: EditionsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Retorna a edição atual (aberta ou publicada mais recente)' })
  @ApiResponse({ status: 200, description: 'Dados da edição atual.' })
  @ApiResponse({ status: 404, description: 'Nenhuma edição ativa.' })
  findCurrent() {
    return this.editionsService.findCurrent();
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as edições publicadas' })
  @ApiResponse({ status: 200, description: 'Lista de edições publicadas.' })
  findAll() {
    return this.editionsService.findAll();
  }
}
