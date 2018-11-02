import config from '../../config';

export type ListQueryRequest = {
    page?: number,
    rows?: number,
}

import { TestApi } from './test';
export * from './test';

export const testApi = new TestApi(config.api.test);