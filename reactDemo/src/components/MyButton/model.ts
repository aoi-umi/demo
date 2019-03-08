import { observable, action, runInAction } from 'mobx';
type OnLoaded = () => any;
export class MyButtonModel {
    @observable
    loading: boolean;

    onLoaded: OnLoaded;
    constructor(opt?: { onLoaded?: OnLoaded }) {
        if (opt) {
            this.onLoaded = opt.onLoaded;
        }
    }

    @action
    async load() {
        this.loading = true;
    }

    @action
    async loaded() {
        this.loading = false;
        this.onLoaded && this.onLoaded();
    }

}