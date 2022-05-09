import { Injectable } from '@nestjs/common';
import * as config from 'config';
import * as fs from 'fs';

import { EnvConfigType } from 'config/default';

export const env = config as config.IConfig & EnvConfigType;
@Injectable()
export class ConfigService {
  constructor() {
    const fileDir = this.env.fileDir;
    if (fileDir) {
      if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });
    }
  }
  get env() {
    return env;
  }
}
