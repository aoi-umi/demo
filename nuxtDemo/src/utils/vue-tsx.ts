import * as vpd from 'vue-property-decorator';
interface VueComponentOptions {
    ref?: any;
    class?: any;
    style?: { [key: string]: any };
    props?: any;
    slot?: string;
    name?: string;
}

export function convClass<prop>(t) {
    return t as {
        new(props: prop & VueComponentOptions): any
    };
}

//将Prop类转为mixins的参数
export function getCompOpts(target) {
    const Ctor = typeof target === 'function'
        ? target
        : target.constructor;
    const decorators = Ctor.__decorators__;
    const options: any = {};
    if (decorators) {
        decorators.forEach(function (fn) { return fn(options); });
    }
    return options;
}

import { PropOptions } from 'vue';
import { Constructor } from 'vue-property-decorator';
export function Prop(options?: PropOptions | Constructor[] | Constructor) {
    return vpd.Prop(...arguments) as (target: any, key: string) => void;
}