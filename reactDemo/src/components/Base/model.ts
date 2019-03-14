import { observable, action, runInAction } from 'mobx';

type ValidError = { msg: string };
type Validators<T> = {
    [key: string]: {
        name?: string;
        validator: ((val: any, field: T) => ValidError | void)[];
    }
}
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
        this.field[key] = value;
        this.valid(key);
    }

    valid(key: string) {
        let rs = { isVaild: true, err: null as ValidError };
        let validConfig = this.validConfig && this.validConfig[key];
        if (validConfig) {
            for (let ele of validConfig.validator) {
                runInAction(() => {
                    rs.err = ele(this.field[key], this.field) || { msg: '' };
                    if (rs.err.msg)
                        rs.err.msg = `${(validConfig.name || key)} ${rs.err.msg}`;
                    this.fieldErr[key] = rs.err;
                });
                rs.isVaild = !rs.err.msg;
            }
        }
        return rs;
    }

    validAll() {
        let isVaild = true;
        for (let key in this.field) {
            let rs = this.valid(key);
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