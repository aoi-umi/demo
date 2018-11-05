
import { observable, action, runInAction } from 'mobx';
export class MyDialogModel {
    @observable
    open: boolean;
    constructor() {
        this.init();
    }
    @action
    init = () => {
        this.open = true;
    }

    @action
    toggle = (open?: boolean) => {
        this.open = open === undefined ? !this.open : open;
    }
}