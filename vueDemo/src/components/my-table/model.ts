
export class MyTableModel<T extends object = object> {
    page = {
        index: 1,
        size: 10
    };
    query = {} as T;
}