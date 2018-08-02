/// <reference types="jquery"/>
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
    mainContent?: MyInterfaceModule;
    mainContentType?: MyInterfaceModule;
    userInfo?: MyInterfaceModule;
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
    addOrOpenTab:(opt: TabAndPanelOption) => void;
}