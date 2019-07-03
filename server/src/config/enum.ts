import { Enum, EnumInstanceObject, EnumInstance } from 'enum-ts';
export const enumDefine = {
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
export const myEnum = Enum.createInstance(enumDefine);

export function getEnumValueByStr(enumTs: EnumInstance<any, any>, enumStr: string, split = ',') {
    let arr = enumTs.toArray();
    let matchEnum = [];
    enumStr.split(split).forEach(ele => {
        let match = arr.find(s => s.value == ele);
        if (match)
            matchEnum.push(match.value);
    });
    return matchEnum;
}