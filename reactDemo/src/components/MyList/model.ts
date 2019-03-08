
import { observable, action, runInAction } from 'mobx';
import { Model } from '../Base';
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
    constructor(query: T) {
        runInAction(() => {
            this.query = query;
        });
    }

    @action
    async load() {
        this.loading = true;
    }

    @action
    changeResult(value: QueryResult) {
        this.loading = false;
        this.result = value;
        if (value.success)
            this.page.setTotal(value.data.total);
    }

}

export type QueryDataType = { rows: any[], total: number };
export type QueryResult = {
    success?: boolean;
    data?: QueryDataType;
    msg?: string;
}