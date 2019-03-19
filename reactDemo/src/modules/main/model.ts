import { observable, action, runInAction } from 'mobx';
export class Main {
    @observable
    title: string;

    @observable
    open: boolean;

    @observable
    user: User;

    constructor() {
        this.init();
    }
    @action
    init = () => {
        this.open = false;
        this.user = new User();
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

export class User {
    @observable
    _id: string;

    @observable
    account: string;

    @observable
    nickname: string;

    constructor() {
        this.init();
    }

    @action
    init = (user?) => {
        if (!user) {
            user = {
                _id: '',
                nickname: 'guest',
                account: ''
            }
        }
        ['_id', 'nickname', 'account'].forEach(key => {
            this[key] = user[key];
        });
    }

    get isLogin() {
        return !!this._id;
    }
}