import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UtilsService } from 'src/processors/utils/utils.service';

import { Cat } from './cats.entity';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cat])],
  providers: [CatsService, UtilsService],
  controllers: [CatsController],
})
export class CatsModule {}
