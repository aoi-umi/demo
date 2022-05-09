import {
  ExceptionFilter,
  Catch,
  HttpException,
  HttpStatus,
  ExecutionContext,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { ResponseCommon } from 'src/processors/response/response.common';

@Catch()
export class AllExceptionsFilter<T> implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: T, context: ExecutionContext) {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();

    let httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (![404].includes(httpStatus)) httpStatus = 200;
    const resBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(req),
      ...new ResponseCommon(exception).getResObj(),
    };

    console.log(exception);

    const logObj = req.logObject;
    logObj.end(req, resBody);

    httpAdapter.reply(ctx.getResponse(), resBody, httpStatus);
  }
}
