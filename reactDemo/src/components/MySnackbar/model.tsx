
import { observable, action, runInAction } from 'mobx';
export class PaginationModel {
    @observable
    open: boolean;
    constructor() {
        this.init();
    }
    @action
    init = () => {
        this.open = false;
    }

    @action
    toggle = (open?: boolean) => {
        this.open = open === undefined ? !this.open : open;
    }
}