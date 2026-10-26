import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParserImport from 'cookie-parser';
const cookieParser = (cookieParserImport as any).default || cookieParserImport;
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const explicitOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim().replace(/\/+$/, ''))
    : [];

  const defaultOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3100',
    'http://127.0.0.1:3100',
  ];

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...explicitOrigins]));

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server, curl)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, '');

      // Direct match in allowed list
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      // Allow frontend running on ports 3000 or 3100 on any IP or domain
      if (/^https?:\/\/.*:(3000|3100)$/.test(normalizedOrigin)) {
        return callback(null, true);
      }

      // If in non-production, be permissive
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      callback(new Error(`Origin '${origin}' not permitted by CORS policy.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 4001;
  await app.listen(port, '0.0.0.0');
  console.log(`Typing Typhon API running on http://localhost:${port}/api/v1`);
}

bootstrap();
