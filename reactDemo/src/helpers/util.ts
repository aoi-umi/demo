import axios, { AxiosRequestConfig } from 'axios';
import { withStyles } from '@material-ui/core/styles';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import withWidth, { WithWidthOptions } from '@material-ui/core/withWidth';
import { withRouter } from 'react-router';
import * as md from 'node-forge/lib/md.all';

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

    if (opt.method.toLowerCase() == 'get')
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

export function withStylesDeco<ClassKey extends string, Options extends WithStylesOptions<ClassKey> = {}>(style, options?: Options) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        return withStyles(style, options)(constructor as any) as any as T;
    }
}

export function withRouterDeco<T extends { new(...args: any[]): {} }>(constructor: T) {
    return withRouter(constructor as any) as any as T;
}

export function withWidthDeco(options?: WithWidthOptions) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        return withWidth(options)(constructor as any) as any as T;
    }
}

export function error(e, code?) {
    if (!(e instanceof Error))
        e = new Error(e);
    return e;
}

export function randStr() {
    return Math.random().toString(36).substr(2, 15);
}

export function md5(str: string) {
    let md5 = md.md5.create();
    md5.update(str);
    return md5.digest().toHex();
}

export let stringFormat = function (formatString: string, ...args) {
    if (!formatString)
        formatString = '';
    let reg = /(\{(\d)\})/g;
    if (typeof args[0] === 'object') {
        args = args[0];
        reg = /(\{([^{}]+)\})/g;
    }
    let result = formatString.replace(reg, function () {
        let match = arguments[2];
        return args[match] || '';
    });
    return result;
};

export const stopAnimation = (animations: anime.AnimeInstance | anime.AnimeInstance[]) => {
    const stop = (anim: anime.AnimeInstance) => {
        if (anim) {
            const { duration, remaining } = anim;
            if (remaining === 1) anim.seek(duration);
            else anim.pause();
        }
    };
    if (Array.isArray(animations)) animations.forEach(anim => stop(anim));
    else stop(animations);
};

export function defer<T = any>() {
    let resolve: (value?: T | PromiseLike<T>) => void,
        reject: (reason?: any) => void;
    let promise = new Promise<T>((reso, reje) => {
        resolve = reso;
        reject = reje;
    });
    return {
        promise,
        resolve,
        reject,
    };
}