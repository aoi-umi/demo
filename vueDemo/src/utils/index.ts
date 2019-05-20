export function convertToClass<typeofT, T = {}>(t) {
    return t as {
        new(props: Partial<typeofT & T> & {
            onClick?: () => any
            ref?: any;
            class?: any;
            style?: { [key: string]: any };
        }): any
    };
}