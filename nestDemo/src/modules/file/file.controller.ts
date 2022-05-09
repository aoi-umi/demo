import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Req,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import { ConfigService } from 'src/processors/config/config.service';

import { FileService } from './file.service';
import { UpdateFileDto } from './dto/update-file.dto';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private configService: ConfigService,
  ) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post('/upload')
  upload(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    return 'This action adds a new file';
  }

  @Get()
  getFile(@Query() data, @Req() req: Request, @Res() res: Response) {
    const reqRange = req.headers.range as string;
    let range;
    if (reqRange) {
      const pos = reqRange.replace(/bytes=/, '').split('-');
      const start = parseInt(pos[0], 10);
      const end = pos[1] ? parseInt(pos[1], 10) : 0;
      range = {
        start,
        end,
      };
    }
    const rs = this.fileService.getFile(data._id, {
      range,
    });
    if (!rs) {
      res.status(HttpStatus.NOT_FOUND).end();
      return;
    }

    if (data.contentType)
      res.header({
        'Content-Type': data.contentType,
      });
    if (rs.range) {
      const total = rs.length;
      const { start, end } = rs.range;
      const chunksize = end - start + 1;

      res.status(HttpStatus.PARTIAL_CONTENT);
      res.set({
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
      });
    } else {
      if (rs.noModified) {
        res.status(HttpStatus.NOT_MODIFIED).end();
        return;
      }
      res.set({
        'Content-Length': rs.length.toString(),
        'Content-Disposition': 'inline',
        'Last-Modified': (rs.modifiedDate || new Date()).toUTCString(),
      });
    }
    rs.stream.pipe(res);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // HttpStatus.NOT_MODIFIED
    return this.fileService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.fileService.update(+id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileService.remove(+id);
  }
}
