import axios, { AxiosRequestConfig } from 'axios';
import { withStyles } from '@material-ui/core/styles';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

export function ajax(options: AxiosRequestConfig) {
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
        opt.headers = {
            ...opt.headers,
            ...options.headers,
        }
        delete options.headers;
    }
    opt = {
        ...opt,
        ...options,
    }
    return axios.request(opt).then(t => {
        return t.data;
    });
}

export function withStylesDeco<ClassKey extends string, Options extends WithStylesOptions<ClassKey> = {}>(style, options?: Options) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        let newClass = withStyles(style, options)(constructor as any) as any as T;
        return class extends newClass {
        }
    }
}

export function connectDeco(mapStateToProps, mapDispatchToProps?) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        let newClass = connect(mapStateToProps, mapDispatchToProps)(constructor as any) as any as T;
        return class extends newClass {
        }
    }
}

export function withRouterDeco<T extends { new(...args: any[]): {} }>(constructor: T) {
    let newClass = withRouter(constructor as any) as any as T;
    return class extends newClass {

    }
}