import copy from 'copy-to-clipboard';

export function convClass<prop, partial extends boolean = false>(t) {
    return t as {
        new(props: (partial extends false ? prop : Partial<prop>) & VueComponentOptions): any
        // new(props: Partial<prop> & VueComponentOptions): any
    };
}

export function getCompOpts(target) {
    let Ctor = typeof target === 'function'
        ? target
        : target.constructor;
    let decorators = Ctor.__decorators__;
    let options: any = {};
    if (decorators) {
        decorators.forEach(function (fn) { return fn(options); });
    }
    return options;
}

export class Utils {
    static base64ToFile = (dataUrl: string, filename: string) => {
        let arr = dataUrl.split(',');
        let mime = arr[0].match(/:(.*?);/)[1];
        let bstr = atob(arr[1]);
        let n = bstr.length;
        let u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    static getStyleName(stylePrefix: string, ...args: string[]) {
        return args.filter(ele => !!ele).map(ele => stylePrefix + ele);
    }

    static dateParse(date) {
        if (typeof date == 'string')
            date = date.replace(/-/g, '/');
        if (!isNaN(date) && !isNaN(parseInt(date)))
            date = parseInt(date);
        if (!(date instanceof Date))
            date = new Date(date);
        return date;
    }

    static getDateDiff(date1, date2) {
        date1 = this.dateParse(date1);
        date2 = this.dateParse(date2);

        let isMinus = false;
        //date1 开始日期 ，date2 结束日期
        let timestamp = date2.getTime() - date1.getTime(); //时间差的毫秒数
        if (timestamp < 0) {
            timestamp = -timestamp;
            isMinus = true;
        }
        timestamp /= 1000;
        let seconds = Math.floor(timestamp % 60);
        timestamp /= 60;
        let minutes = Math.floor(timestamp % 60);
        timestamp /= 60;
        let hours = Math.floor(timestamp % 24);
        timestamp /= 24;
        let days = Math.floor(timestamp);
        let diff = (days ? days + ' ' : '') + ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2);
        if (isMinus)
            diff = '-' + diff;
        return diff;
    }

    static copy2Clipboard(txt) {
        copy(txt);
    }

    static isScrollEnd(elm?: HTMLElement | Window) {
        let scrollTop, clientHeight, scrollHeight;
        if (!elm || elm instanceof Window || [document.body].includes(elm)) {
            scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
            scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        } else {
            scrollTop = elm.scrollTop;
            clientHeight = elm.clientHeight;
            scrollHeight = elm.scrollHeight;
        }
        // console.log('--------------');
        // console.log([document.documentElement.scrollTop, document.documentElement.clientHeight, document.documentElement.scrollHeight].join(','));
        // console.log([document.body.scrollTop, document.body.clientHeight, document.body.scrollHeight].join(','));
        // console.log([scrollTop, clientHeight, scrollHeight].join(','));
        return (scrollTop + clientHeight >= scrollHeight);
    }

    static isWxClient() {
        return /MicroMessenger/i.test(navigator.userAgent);
    };
}