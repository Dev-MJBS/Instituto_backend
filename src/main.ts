import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import { join } from 'path';
import { AppModule } from './app.module';
import { winstonConfig } from './config/logger.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { validateEnv } from './config/env.validation';

async function bootstrap() {
  // Validate environment variables before starting
  validateEnv();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // ─── Global Prefix ─────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── CORS ──────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: [
      'http://localhost:3000',
      process.env.FRONTEND_URL ?? 'https://institutojob.com.br',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ─── Static Files (uploads) ────────────────────────────────────────────────
  const uploadDir = process.env.UPLOAD_DIR ?? './uploads';
  app.useStaticAssets(join(process.cwd(), uploadDir), {
    prefix: '/uploads',
  });

  // ─── Global Validation Pipe ────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: 422,
    }),
  );

  // ─── Global Exception Filter ───────────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ─── Swagger / OpenAPI ─────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Instituto Job de Brito API')
    .setDescription(
      'API do Instituto de Educação e Pesquisa Job de Brito (IJB) — ' +
        'Revista Científica Benedito Coscia (RCBC)',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('Contact', 'Formulário de contato')
    .addTag('Editions', 'Edições da revista RCBC')
    .addTag('Submissions', 'Submissão de artigos')
    .addTag('Articles', 'Artigos publicados')
    .addTag('Auth', 'Autenticação')
    .addTag('Admin', 'Painel administrativo (protegido)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ─── Start ─────────────────────────────────────────────────────────────────
  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 Application running on http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger docs at   http://localhost:${port}/api/docs`);
}

bootstrap();
