import { Delete, Get, Param, Patch, Post } from '@nestjs/common';

export class BaseTestController {
  @Post()
  create() {
    return 'post';
  }

  @Get()
  findAll() {
    return 'get';
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return 'get:id';
  }

  @Get('/notId')
  getNotId() {
    return 'notId';
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return 'update';
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return 'remove';
  }
}

export const BaseTest2Controller = () => {
  return BaseTestController;
};

class A extends BaseTest2Controller() {}
