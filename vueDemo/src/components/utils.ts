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
}