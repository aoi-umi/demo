import { Module } from '@nestjs/common';

import { ConfigService } from 'src/processors/config/config.service';

import { FileService } from './file.service';
import { FileController } from './file.controller';

@Module({
  controllers: [FileController],
  providers: [FileService, ConfigService],
})
export class FileModule {}
