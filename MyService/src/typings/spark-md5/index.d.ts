
declare module 'spark-md5' {
    export function hash(str: string, raw?: boolean): string;
    export class ArrayBuffer {
        append(arr: ArrayBuffer): this;
        end(raw?: boolean): string;
    }
}

