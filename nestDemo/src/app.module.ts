import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './modules/cats/cats.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigService, env } from './processors/config/config.service';
import { LoggerService } from './processors/logger/logger.service';
import { FileModule } from './modules/file/file.module';
import { TestModule } from './modules/test/test.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...env.db,
      autoLoadEntities: true,
    }),
    CatsModule,
    UsersModule,
    FileModule,
    TestModule,
  ],
  controllers: [AppController],
  providers: [AppService, LoggerService, ConfigService],
})
export class AppModule implements NestModule {
  constructor(private config: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {
    return;
  }
}
