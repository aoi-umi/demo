
import { observable, action, runInAction } from 'mobx';
type onPageChangeHandler = () => any;
export class PaginationModel {
    @observable
    pageIndex: number;
    @observable
    pageSize: number;

    @observable
    totalPage: number;
    @observable
    total: number;

    onPageChange?: onPageChangeHandler;
    constructor(opt?: {
        onPageChange?: onPageChangeHandler;
    }) {
        this.init();
        if (opt) {
            if (opt.onPageChange)
                this.onPageChange = opt.onPageChange
        }
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
        if (page >= 0) {
            this.pageIndex = page;
            this.onPageChange && this.onPageChange();
        }
    }
    @action
    setPageSize = (pageSize: number | string) => {
        this.pageSize = parseInt(pageSize as string);
    }
}