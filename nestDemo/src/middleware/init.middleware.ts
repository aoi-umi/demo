import { Request } from 'express';
import { LoggerService } from 'src/processors/logger/logger.service';

export const init = (opt: { loggerService: LoggerService }) => {
  const { loggerService } = opt;
  return (req: Request, res: any, next: () => void) => {
    const logObject = (req.logObject = loggerService.getInstance());
    logObject.start();
    next();
  };
};
