
import { observable, action, runInAction } from 'mobx';
import { PaginationModel } from '../MyPagination';
type OnQuery = () => any;
export class ListModel<T extends Model = Model> {
    page = new PaginationModel();

    query: T;

    @observable
    result: QueryResult;

    @observable
    loading: boolean;

    onQuery?: OnQuery;
    constructor(query: T, opt?: {
        onQuery?: OnQuery;
    }) {
        runInAction(() => {
            this.query = query;
        });
    }

    @action
    async load() {
        this.loading = true;
        this.onQuery && await this.onQuery();
    }

    @action
    changeResult(value: QueryResult) {
        this.loading = false;
        this.result = value;
        if (value.success)
            this.page.setTotal(value.data.total);
    }

}

export abstract class Model {
    constructor() {
        this.init();
    }
    abstract init(): void;
    @action
    changeValue(key: string, value: any) {
        this[key] = value;
    }
}

export type QueryDataType = { rows: any[], total: number };
export type QueryResult = {
    success?: boolean;
    data?: QueryDataType;
    msg?: string;
}