export function convertToClass<typeofT>(t) {
    return t as {
        new(props: Partial<typeofT> & {
            onClick?: () => any
        }): any
    };
}