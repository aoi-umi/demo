import axios, { AxiosRequestConfig } from 'axios';

export function convertToClass<typeofT, T = {}>(t) {
    return t as {
        new(props: Partial<typeofT & T> & {
            onClick?: () => any;
            onKeypress?: (e) => any;
            ref?: any;
            class?: any;
            style?: { [key: string]: any };
        }): any
    };
}

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

    if (opt.method && opt.method.toLowerCase() == 'get')
        opt.params = opt.data;

    return axios.request(opt);
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

function getDeco(fn: (constructor) => any) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        return fn(constructor);
    }
}

export function error(e, code?) {
    if (!(e instanceof Error))
        e = new Error(e);
    return e;
}