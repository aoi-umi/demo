import config from '../../config';

export type ListQueryRequest = {
    pageIndex?: number,
    pageSize?: number,
}

import { TestApi } from './test';
export * from './test';

export const testApi = new TestApi(config.api.test);