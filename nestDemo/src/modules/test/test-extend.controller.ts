import { Controller, Get } from '@nestjs/common';
import { BaseTestController } from '../base/BaseTestController';

@Controller('test-ex')
export class TestExController extends BaseTestController {
  @Get('/notId')
  getNotId() {
    return 'notId';
  }
}
