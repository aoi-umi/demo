/// <reference types="jquery"/>
interface JQueryStatic {
    ui: any;
}

interface JQuery {
    autocomplete: any;
}

interface File {
    mozSlice: any;
    webkitSlice: any;
}

type Api = (data?, option?) => Q.Promise<any>;

interface MyInterfaceApi {
    //自定义
    signUp?: Api;
    signIn?: Api;
    signOut?: Api;

    onlineUserQuery?: Api;
    onlineUserDetailQuery?: Api;

    mainContentStatusUpdate?: Api;

    userInfoAdminSave?: Api;

    //模块
    mainContentQuery?: Api;
    mainContentDetailQuery?: Api;
    mainContentSave?: Api;
    mainContentDel?: Api;

    mainContentTypeQuery?: Api;
    mainContentTypeDetailQuery?: Api;
    mainContentTypeSave?: Api;
    mainContentTypeDel?: Api;

    userInfoQuery?: Api;
    userInfoDetailQuery?: Api;
    userInfoSave?: Api;
    userInfoDel?: Api;

    authorityQuery?: Api;
    authorityDetailQuery?: Api;
    authoritySave?: Api;
    authorityDel?: Api;

    roleQuery?: Api;
    roleDetailQuery?: Api;
    roleSave?: Api;
    roleDel?: Api;

    structQuery?: Api;
    structDetailQuery?: Api;
    structSave?: Api;
    structDel?: Api;
}