import { env } from '../config';

export type ApiListQueryArgs = {
    page?: number,
    rows?: number,
    orderBy?: string;
    sortOrder?: string;
}

export type ApiMethod<U, T> = {
    [P in keyof T]: U
}

import { TestApi } from './test';
export * from './test';

export const testApi = new TestApi(env.api.test);