import { Module } from '@nestjs/common';
import { TestExController } from './test-extend.controller';
import { TestController } from './test.controller';
import { TestService } from './test.service';

@Module({
  imports: [],
  providers: [TestService],
  controllers: [TestController, TestExController],
})
export class TestModule {}
