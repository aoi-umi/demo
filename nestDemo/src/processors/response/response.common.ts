import { BadRequestException } from '@nestjs/common';

export class ResponseCommon {
  success: boolean;
  data: any;
  err: any;
  constructor(err, data?) {
    this.success = err ? false : true;
    this.err = err;
    this.data = data;
  }

  getResObj() {
    let msg = '';
    let data = this.data;
    if (!this.success) {
      msg = this.err;
      if (this.err instanceof Error) msg = this.err.message;
      if (this.err instanceof BadRequestException) {
        const res = this.err.getResponse() as any;
        data = res?.message;
      }
    }

    return {
      success: this.success,
      data,
      msg,
    };
  }
}
