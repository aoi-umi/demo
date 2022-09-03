import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RedisOptions } from 'ioredis';

export type EnvConfigType = {
  env: string;
  port: string;
  fileDir: string;
  db: TypeOrmModuleOptions;
  redis: RedisOptions;
};

const c: EnvConfigType;
export = c;
