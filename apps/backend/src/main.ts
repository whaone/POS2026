import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Luminous POS API')
    .setDescription('POS2026 Backend REST API Contract')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  if (process.argv.includes('--generate-openapi')) {
    const fs = await import('fs');
    fs.writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
    console.log('OpenAPI spec written to ./openapi.json');
    await app.close();
    process.exit(0);
  }

  // F1-INFRA-03: ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: 400,
    }),
  );

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
