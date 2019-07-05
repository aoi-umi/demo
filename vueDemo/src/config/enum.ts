import { Enum } from 'enum-ts';
const enumDefineBack = {
    authorityStatus: {
        禁用: 0,
        启用: 1
    },
    roleStatus: {
        禁用: 0,
        启用: 1
    },
    userStatus: {
        禁用: 0,
        待审核: 1,
        正常: 2
    },

    socket: {
        弹幕发送: 'danmakuSend',
        弹幕接收: 'danmakuRecv'
    },
};

const enumDefineFront = {
    userEditType: {
        修改: 'edit',
        封禁: 'disable',
    },
    userDisableType: {
        解封: 0,
        封禁至: 1,
    },
};
export const enumDefine = {
    ...enumDefineBack,
    ...enumDefineFront
};
export const myEnum = Enum.createInstance(enumDefine);