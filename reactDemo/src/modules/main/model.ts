import { observable, action, runInAction } from 'mobx';
export class Main {
    @observable
    title: string;

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
    toggleDrawer = (open?: boolean) => {
        if (open === undefined)
            this.open = !this.open;
        else
            this.open = open;
    }
    @action
    setTitle = (title: string) => {
        this.title = title;
    }
};