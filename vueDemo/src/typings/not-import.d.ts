interface VueComponentOptions {
    ref?: any;
    class?: any;
    style?: { [key: string]: any };
    props?: any;
    slot?: string;
    name?: string;
}

interface UserInfo {
    _id: string;
    account: string;
    nickname: string;
    key: string;
    authority: { [key: string]: boolean };
}