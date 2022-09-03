import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import * as morgan from 'morgan';

import 'multer';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { HandlerAfterInterceptor } from './interceptor/handler-after.interceptor';
import { init } from './middleware/init.middleware';
import { ConfigService } from './processors/config/config.service';
import { LoggerService } from './processors/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  const config = new DocumentBuilder()
    .setTitle('api docs')
    .setDescription('The API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'My API Docs',
  };
  SwaggerModule.setup('docs', app, document, customOptions);
  const httpAdapterHost = app.get(HttpAdapterHost);
  const logSer = app.get(LoggerService);
  const configSer = app.get(ConfigService);

  app.use(morgan('dev'));
  app.use(init({ loggerService: logSer }));

  /**
    HandlerAfterInterceptor 记录success
    AllExceptionsFilter 记录error
  * */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new HandlerAfterInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  await app.listen(configSer.env.port || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
