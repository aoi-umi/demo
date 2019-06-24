import { Enum } from 'enum-ts';
export const enumDefine = {
    authorityStatus: {
        禁用: 0,
        启用: 1
    },
    roleStatus: {
        禁用: 0,
        启用: 1
    },

    socket: {
        弹幕发送: 'danmakuSend',
        弹幕接收: 'danmakuRecv'
    },
};
export const myEnum = Enum.createInstance(enumDefine);