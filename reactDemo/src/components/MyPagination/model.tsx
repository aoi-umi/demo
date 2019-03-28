
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
        opt = {
            ...opt
        }
        if (opt.onPageChange)
            this.onPageChange = opt.onPageChange
    }
    defaultPageSize = 10;
    @action
    init = () => {
        this.pageIndex = 1;
        this.pageSize = this.defaultPageSize;
        this.total = 0;
        this.totalPage = 0;
    }

    @action
    setTotal = (total: number) => {
        this.total = total;
        this.totalPage = this.pageSize ? total / this.pageSize : 0;
    }
    @action
    setPage = (page: number | string) => {
        page = parseInt(page as string);
        page = isNaN(page) ? 1 : page;
        if (page >= 1) {
            this.pageIndex = page;
            this.onPageChange && this.onPageChange();
        }
    }
    @action
    setPageSize = (pageSize: number | string) => {
        pageSize = parseInt(pageSize as string);
        this.pageSize = isNaN(pageSize) ? this.defaultPageSize : pageSize;
    }
}