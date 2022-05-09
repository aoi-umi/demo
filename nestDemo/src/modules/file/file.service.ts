import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigService } from 'src/processors/config/config.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Injectable()
export class FileService {
  constructor(private configService: ConfigService) {}
  create(createFileDto: CreateFileDto) {
    return 'This action adds a new file';
  }

  private getFilePath(filename) {
    return path.resolve(this.configService.env.fileDir, filename);
  }

  getFile(
    filename,
    opt: {
      fileType?: string;
      range?: {
        start: number;
        end: number;
      };
      ifModifiedSince?: string;
    },
  ) {
    const filePath = this.getFilePath(filename);
    let stream: NodeJS.ReadableStream;
    if (fs.existsSync(filePath)) {
      const noModified = false;
      const modifiedDate = null;
      const fileStat = fs.statSync(filePath);
      const length = fileStat.size;
      let streamOpt;
      let range: { start: number; end: number };
      if (opt.range) {
        range = {
          start: opt.range.start,
          end: opt.range.end || length - 1,
        };
        streamOpt = {
          start: range.start,
          end: range.end + 1,
        };
      }
      stream = fs.createReadStream(filePath, streamOpt);

      return {
        stream,
        length,
        range,
        noModified,
        modifiedDate,
      };
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
