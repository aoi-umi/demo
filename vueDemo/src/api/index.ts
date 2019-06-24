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


import { TestSocket } from './testSocket';
export const testSocket = new TestSocket(env.socket.test.host, {
    path: env.socket.test.path,
});