
import { observable, action, runInAction } from 'mobx';
export class PaginationModel {
    @observable
    pageIndex: number;
    @observable
    pageSize: number;

    @observable
    totalPage: number;
    @observable
    total: number;
    constructor() {
        this.init();
    }
    @action
    init = () => {
        this.pageIndex = 0;
        this.pageSize = 10;
        this.total = 0;
        this.totalPage = 0;
    }

    @action
    setTotal = (total: number) => {
        this.total = total;
        this.totalPage = this.pageSize ? total / this.pageSize : 0;
    }
    @action
    setPage = (page: number) => {
        if (page >= 0)
            this.pageIndex = page;
    }
    @action
    setPageSize = (pageSize: number | string) => {
        this.pageSize = parseInt(pageSize as string);
    }
}