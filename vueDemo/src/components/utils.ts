import copy from 'copy-to-clipboard';

export function convClass<typeofT, T = {}>(t) {
    return t as {
        new(props: Partial<typeofT & T> & VueComponentOptions): any
    };
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
        return args.map(ele => stylePrefix + ele);
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

    static isScrollEnd(elm?: HTMLElement) {
        if (!elm)
            elm = document.documentElement;
        let scrollTop = elm.scrollTop || elm.scrollTop;
        let clientHeight = elm.clientHeight || elm.clientHeight;
        let scrollHeight = elm.scrollHeight || elm.scrollHeight;
        return (scrollTop + clientHeight == scrollHeight);
    }
}