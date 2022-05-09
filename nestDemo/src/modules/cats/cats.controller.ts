import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/processors/auth/auth.decorator';
import { UtilsService } from 'src/processors/utils/utils.service';
import { CatsService } from './cats.service';

@ApiTags('cats')
@Controller('cats')
export class CatsController {
  constructor(
    private readonly service: CatsService,
    private utilsSer: UtilsService,
  ) {}

  @Get()
  findAll(@Query() query) {
    let options = this.utilsSer.queryToOrmOptions(query);
    return this.service.findAll(options);
  }

  @Get('/cat2')
  cat2() {
    return `this is a cat2`;
  }

  @Get('/error')
  error() {
    throw new Error('error test');
  }

  @Auth()
  @Get('/auth1')
  auth1() {
    return `auth1`;
  }

  @Auth({
    authority: ['test'],
  })
  @Get('/auth2')
  auth2() {
    return `auth2`;
  }

  @Get('/:id')
  hello3(@Param('id') p) {
    return `this is a byId-${p}`;
  }

  @Get('/cat3')
  cat3() {
    return `this is a cat3`;
  }

  @Post()
  create(@Body() data) {
    return this.service.create(data);
  }
}
