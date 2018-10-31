import { request, extend, clone } from '../../helpers/util';
import { AxiosRequestConfig } from 'axios';
type BeforeRequest = (request: AxiosRequestConfig) => Promise<any>;
type AfterResponse = (response: any) => Promise<any>;
export type RequestByConfigOption = {
    beforeRequest?: BeforeRequest;
    afterResponse?: AfterResponse;
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

    protected async requestByConfig<T = any>(config: T[keyof T], options: RequestByConfigOption) {
        let cfg = clone<ApiMethodConfigType>(config as any);
        let args = clone(this.apiConfig.defaultArgs);
        if (!cfg.isUseDefault && cfg.args) {
            args = extend(args, cfg.args);
        }

        let req: AxiosRequestConfig = extend({
            url: args.host + cfg.url,
            method: cfg.method,
        }, options);
        let beforeRequest = options.beforeRequest || this.beforeRequest;
        let afterResponse = options.afterResponse || this.afterResponse;
        if (beforeRequest)
            req = await beforeRequest(req);
        let response = await request(req);
        if (afterResponse)
            response = await afterResponse(response);
        return response as T;
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