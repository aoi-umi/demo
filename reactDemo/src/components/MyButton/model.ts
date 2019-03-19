import { observable, action, runInAction } from 'mobx';
import { LoadModel, LoadModelOptions } from '../Base';
export class MyButtonModel extends LoadModel {
    @observable
    countDown: number;

    constructor(opt?: LoadModelOptions) {
        super(opt);
    }

    @action
    setCountDown(seconds: number) {
        if (!this.countDown || this.countDown < 0) {
            this.countDown = seconds;
            let timer = setInterval(() => {
                runInAction(() => {
                    if (--this.countDown <= 0)
                        clearInterval(timer);
                });
            }, 1000);
        }
    }
}