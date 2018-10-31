import axios, { AxiosRequestConfig } from 'axios';
import { withStyles } from '@material-ui/core/styles';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { withRouter } from 'react-router';

export function request(options: AxiosRequestConfig) {
    if (!options.url)
        throw new Error('url can not empty!');
    let opt: AxiosRequestConfig = {
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*'
        },
        method: 'POST',
    };
    if (options.headers) {
        opt.headers = extend({}, opt.headers, options.headers);
        delete options.headers;
    }
    opt = extend(opt, options);
    return axios.request(opt).then(t => {
        return t.data;
    });
}

export function extend(...args) {
    var res = args[0] || {};
    for (let i = 1; i < args.length; i++) {
        var arg = args[i];
        if (typeof (arg) !== 'object') {
            continue;
        }
        for (var key in arg) {
            if (arg[key] !== undefined)
                res[key] = arg[key];
        }
    }
    return res;
}

export function clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function withStylesDeco<ClassKey extends string, Options extends WithStylesOptions<ClassKey> = {}>(style, options?: Options) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        return withStyles(style, options)(constructor as any) as any as T;
    }
}

export function withRouterDeco<T extends { new(...args: any[]): {} }>(constructor: T) {
    return withRouter(constructor as any) as any as T;
}

export function UniqueKey(key?: string) {
    return Symbol(key) as any as string;
}