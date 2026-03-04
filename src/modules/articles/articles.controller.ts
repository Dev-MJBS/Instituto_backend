import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { QueryArticlesDto } from './dto/query-articles.dto';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista artigos publicados (paginado)' })
  @ApiResponse({ status: 200, description: 'Lista paginada de artigos.' })
  findAll(@Query() query: QueryArticlesDto) {
    return this.articlesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna um artigo pelo ID' })
  @ApiParam({ name: 'id', type: String, description: 'UUID do artigo' })
  @ApiResponse({ status: 200, description: 'Dados completos do artigo.' })
  @ApiResponse({ status: 404, description: 'Artigo não encontrado.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.findOne(id);
  }
}
