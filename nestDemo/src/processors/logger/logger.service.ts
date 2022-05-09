import { Injectable } from '@nestjs/common';
import { Request } from 'express';

export type LoggerInstance = {
  start: () => any;
  end: (req: Request, res?: any) => any;
  startAt?: number;
  req?: any;
  res?: any;
};

declare module 'express' {
  interface Request {
    logObject: LoggerInstance;
  }
}

@Injectable()
export class LoggerService {
  log(data: any) {
    console.log(data);
  }

  getInstance() {
    const that = this as LoggerService;
    // console.log('Before...');
    const obj: LoggerInstance = {
      start: () => {
        obj.startAt = Date.now();
      },
      end: (req, res) => {
        const reqData = {
          path: req.path,
          params: req.params,
          body: req.body,
          query: req.query,
        };
        if (res) obj.res = res;
        // that.log({ req: reqData, res: obj.res });

        let duration = Date.now() - obj.startAt;
        // console.log(`After... ${duration}ms`);
      },
    };
    return obj;
  }
}
