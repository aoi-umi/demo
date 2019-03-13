import { observable, action, runInAction } from 'mobx';

export abstract class Model<T> {
    constructor(field: T) {
        runInAction(() => {
            this.field = field;
        });
        this.init();
    }
    abstract init(): void;

    @observable
    field: T;

    @action
    changeValue(key: string, value: any) {
        this.field[key] = value;
    }
}

export type LoadModelOptions = {
    onLoad?: OnLoad,
    onLoaded?: OnLoaded
};
type OnLoad = () => any;
type OnLoaded = <T=any>(result?: T) => any;
export class LoadModel {
    @observable
    loading: boolean;

    onLoad: OnLoad;
    onLoaded: OnLoaded;
    constructor(opt?: LoadModelOptions) {
        if (opt) {
            this.onLoad = opt.onLoad;
            this.onLoaded = opt.onLoaded;
        }
    }

    @action
    async load() {
        this.loading = true;
        this.onLoad && this.onLoad();
    }

    @action
    async loaded(result?) {
        this.loading = false;
        this.onLoaded && this.onLoaded(result);
    }

}