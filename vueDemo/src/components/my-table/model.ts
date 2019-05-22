
export class MyTableModel<T = any> {
    page = {
        index: 1,
        size: 10
    };
    query: T = {} as any;
}