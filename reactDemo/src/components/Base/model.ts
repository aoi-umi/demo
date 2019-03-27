import { observable, action, runInAction, computed } from 'mobx';

import { ValidError, Validators } from './Valid';
export abstract class Model<T> {
    validConfig: Validators<T>;
    constructor(field: T, opt?: {
        validConfig?: Validators<T>
    }) {
        runInAction(() => {
            this.field = field;
            this.fieldErr = {};
        });
        if (opt) {
            this.validConfig = opt.validConfig;
        }
        this.init();
    }
    abstract init(): void;

    @observable
    field: T;

    @observable
    fieldErr: { [key: string]: ValidError };

    @action
    changeValue(key: string, value: any) {
        this._setValue(key, value);
        this.valid(key);
    }

    @action
    setValue(obj: any) {
        for (let key in obj) {
            this._setValue(key, obj[key]);
            this.valid(key);
        }
    }

    _setValue(key: string, val: any) {
        let list = key.split('.');
        let lastKey = list.pop();
        let obj = this.field;
        if (obj) {
            for (let idx in list) {
                obj = obj[list[idx]];
                if (!obj)
                    break;
            }
        }
        if (obj && lastKey)
            obj[lastKey] = val;
    }

    getValue(key: string) {
        let list = key.split('.');
        let obj = this.field;
        if (obj) {
            for (let idx in list) {
                obj = obj[list[idx]];
                if (!obj)
                    return obj;
            }
        }
        return obj;
    }

    async valid(key: string) {
        let rs = { isVaild: true, err: { msg: '' } as ValidError };
        let validConfig = this.validConfig && this.validConfig[key];
        if (validConfig) {
            for (let ele of validConfig.validator) {
                let msg = await ele(this.getValue(key), this.field, this);
                if (typeof msg == 'string') {
                    rs.err = { msg };
                } else if (msg) {
                    rs.err = msg;
                }
                this.fieldErr[key] = rs.err;
                rs.isVaild = !rs.err.msg;
            }
        }
        return rs;
    }

    async validAll() {
        let isVaild = true;
        for (let key in this.field) {
            let rs = await this.valid(key);
            if (!rs.isVaild)
                isVaild = false;
        }
        return isVaild;
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

export class SelectedItem<T=any>{
    @observable
    selected: boolean;

    value: T;

    @action
    setSelected(selected: boolean) {
        this.selected = selected;
    }
}

export class SelectedObject<T=any> {
    @computed
    get selectedAll() {
        let items = this.getItems();
        return items.length > 0 && items.findIndex(ele => !ele.selected) < 0;
    }

    @computed
    get selected() {
        return this.getItems().findIndex(ele => ele.selected) >= 0;
    }

    @computed
    get selectedItems() {
        return this.getItems().filter(ele => ele.selected);
    }

    @observable
    items: Partial<SelectedItem<T>>[];

    @action
    setItems(items: T[]) {
        this.items = items.map(ele => {
            return {
                selected: false,
                value: ele,
            };
        });
    }

    getItems() {
        return this.items || [];
    }

    @action
    setSelectedAll(selected: boolean) {
        this.setSelected(selected, 0, this.getItems().length - 1);
    }

    @action
    setSelected(selected: boolean, startIdx: number, endIdx?: number) {
        if (isNaN(endIdx))
            endIdx = startIdx;
        let items = this.getItems();
        for (let i = startIdx; i <= endIdx; i++) {
            if (items[i])
                items[i].selected = selected;
        }
    }
}