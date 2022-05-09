import { Controller, Get, Param, Query } from '@nestjs/common';
import { TestService } from './test.service';

@Controller('test')
export class TestController {
  constructor(private testSer: TestService) {}

  @Get('/queuePublisher')
  async queuePublisher() {
    let rs = await this.testSer.publisherQueue(
      Date.now().toString(),
      [1, 2, 3],
    );
    return {
      key: rs.key,
    };
  }

  @Get('/queueSubscriber')
  async queueSubscriber(@Query() query) {
    const rs = await this.testSer.subscriberQueue(query.key, query);
    return rs;
  }

  @Get('/queueSubscriberM')
  async queueSubscriberM(@Query() query) {
    let rs = Promise.allSettled(
      Array.from(new Array(10)).map(() => {
        return this.testSer.subscriberQueue(query.key, query).catch((e) => {
          throw e.message;
        });
      }),
    );
    return rs;
  }
}
