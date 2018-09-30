
import { observable, action, runInAction } from 'mobx';
export class Test {
    @observable
    text: string;
    
    input: string;

    @observable
    count: number;
    constructor() {
        this.init();
        this.setText();
    }
    @action
    init = () => {
        this.text = '';
        this.count = 0;
    }

    @action
    setCount = (val: number) => {
        this.count = val;
    };

    @action
    addCount = () => {
        this.count++;
    };
    @action
    setText = (text?: string) => {
        this.text = text || 'world';
    };
}