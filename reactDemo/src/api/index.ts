import config from '../config/env';

export type ListQueryRequest = {
    page?: number,
    rows?: number,
}

export type ApiMethod<U, T> = {
    [P in keyof T]: U
}

import { TestApi } from './test';
export * from './test';

export const testApi = new TestApi(config.api.test);