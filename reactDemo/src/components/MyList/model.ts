
import { observable, action, runInAction } from 'mobx';
import { Model, LoadModel, LoadModelOptions, SelectedObject } from '../Base';
import { PaginationModel } from '../MyPagination';
export class ListModel<T extends Model<U>=Model<any>, U=any> extends LoadModel {
    page = new PaginationModel();
    selectedRow = new SelectedObject();

    query: T;

    @observable
    result: QueryResult;

    constructor(opt: { query: T } & LoadModelOptions) {
        super(opt);
        runInAction(() => {
            this.query = opt.query;
        });
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