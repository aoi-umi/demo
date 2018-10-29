
import { observable, action, runInAction } from 'mobx';
import { PaginationModel } from '../MyPagination';
export class ListModel<T extends QueryModel> {
    page = new PaginationModel();

    query: T;

    @observable
    result: QueryResult;

    @action
    changeResult(value: QueryResult) {
        this.result = value;
        if (value.success)
            this.page.setTotal(value.data.total);
    }

}

export abstract class QueryModel {
    abstract init(): void;
    @action
    changeValue(key: string, value: any) {
        this[key] = value;
    }
}

export type QueryDataType = { list: any[], total: number };
export type QueryResult = {
    success?: boolean;
    data?: QueryDataType;
    msg?: string;
}