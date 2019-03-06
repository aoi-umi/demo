
import { observable, action, runInAction } from 'mobx';
export abstract class Model {
    constructor() {
        this.init();
    }
    abstract init(): void;
    @action
    changeValue(key: string, value: any) {
        this[key] = value;
    }
}