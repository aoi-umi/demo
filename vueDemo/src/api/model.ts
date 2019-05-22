import { AxiosRequestConfig, AxiosResponse } from 'axios';

import { request, extend, clone } from '../helpers/utils';
type BeforeRequest = (request: AxiosRequestConfig) => any;
type AfterResponse<T=any> = (data: T, response: AxiosResponse<T>) => any;
export type RequestByConfigOption<T> = {
    beforeRequest?: BeforeRequest;
    afterResponse?: AfterResponse<T>;
} & AxiosRequestConfig;
export class ApiModel<T = ApiMethodConfigType> {
    private beforeRequest: BeforeRequest;
    private afterResponse: AfterResponse;
    constructor(protected apiConfig: ApiConfigModel<T>, opt?: {
        beforeRequest?: BeforeRequest;
        afterResponse?: AfterResponse;
    }) {
        opt = extend({}, opt);
        if (opt.beforeRequest)
            this.beforeRequest = opt.beforeRequest;
        if (opt.afterResponse)
            this.afterResponse = opt.afterResponse;
    }

    protected async requestByConfig<U = any>(config: ApiMethodConfigType, options?: RequestByConfigOption<U>) {
        let cfg = clone<ApiMethodConfigType>(config as any);
        let args = clone(this.apiConfig.defaultArgs);
        if (!cfg.isUseDefault && cfg.args) {
            args = extend(args, cfg.args);
        }

        let req: RequestByConfigOption<U> = extend({
            url: args.host + cfg.url,
            method: cfg.method,
        }, options);
        let beforeRequest = req.beforeRequest || this.beforeRequest;
        let afterResponse = req.afterResponse || this.afterResponse;

        if (beforeRequest)
            req = await beforeRequest(req);
        let response = await request(req);
        let data = response.data;
        if (afterResponse)
            data = await afterResponse(data, response);
        return data as U;
    }
}

export type ApiDefaultArgsType = { host: string };
export type ApiMethodConfigType<T extends ApiDefaultArgsType = ApiDefaultArgsType> = {
    url: string,
    method?: string,
    isUseDefault?: boolean,
    args?: T
};
type ApiMethodType<MethodT, T extends ApiDefaultArgsType> = {
    [P in keyof MethodT]: ApiMethodConfigType<T>
}
export type ApiConfigModel<MethodT extends { [key: string]: any }, T extends ApiDefaultArgsType = ApiDefaultArgsType> = {
    defaultArgs: T,
    method: ApiMethodType<MethodT, T>,
}