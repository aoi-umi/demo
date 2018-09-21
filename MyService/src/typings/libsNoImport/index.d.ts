//后端


//前端
interface JQueryStatic {
    ui: any;
}

interface JQuery {
    autocomplete: any;
    datetimepicker: any;
    liMarquee: any;
}

interface File {
    mozSlice: any;
    webkitSlice: any;
}

//myInterface
type Api = (data?, option?) => Q.Promise<any>;
interface MyInterfaceModule {
    query: Api;
    detailQuery: Api;
    save: Api;
    swl: Api;
}
interface MyInterfaceApi {
    //自定义
    signUp?: Api;
    signIn?: Api;
    signOut?: Api;

    onlineUserQuery?: Api;
    onlineUserDetailQuery?: Api;

    mainContentStatusUpdate?: Api;

    userInfoAdminSave?: Api;
    captchaGet?: Api;

    logStatistics?: Api;

    //模块
    log?: MyInterfaceModule;
    mainContent?: MyInterfaceModule;
    mainContentType?: MyInterfaceModule;
    mainContentLog?: MyInterfaceModule;
    userInfo?: MyInterfaceModule;
    userInfoLog?: MyInterfaceModule;
    authority?: MyInterfaceModule;
    role?: MyInterfaceModule;
    struct?: MyInterfaceModule;
}

//myTab
interface TabOption {
    type?: string;
    headerId?: string;
    id?: string;
    name?: string;
    targetId?: string;
    closeTarget?: string;
}
interface PanelOption {
    type?: string;
    id?: string;
    content?: string;
}
interface TabAndPanelOption {
    type?: string;
    id?: string;
    name?: string;
    content?: string;
}
interface MyTab {
    addOrOpenTab: (opt: TabAndPanelOption) => void;
}

//common
interface dataCheckOption {
    list: Array<dataCheckOptionListOption>;
}

interface dataCheckOptionListOption {
    name: string;
    desc?: string,
    dom?: JQuery<HTMLElement>;
    focusDom?: JQuery<HTMLElement>
    canNotNull?: boolean;
    canNotNullDesc?: string;
    isTrim?: boolean;
    getValue?: any;
    // getValue: function () {
    //     return this.dom.find("option:selected").text();
    // },
    checkValue?: Function;
    // checkValue: function (value, model) {
    //     if (!value) {
    //         return ('密码只能由8~20位字母和数字组成');
    //     }
    // }
}

//共用
type ErrorConfigType = {
    code: string;
    status?: number;
}