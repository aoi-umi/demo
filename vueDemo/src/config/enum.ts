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
    articleStatus: {
        草稿: 0,
        待审核: 1,
        审核通过: 2,
        审核不通过: 3,
        已删除: -1,
    },
    commentType: {
        文章: 0,
    },
    commentStatus: {
        正常: 0,
        已删除: -1
    },
    voteType: {
        文章: 0,
        评论: 10
    },
    voteValue: {
        无: 0,
        喜欢: 1,
        不喜欢: 2
    },
    followStatus: {
        未关注: 0,
        已关注: 1,
        已取消: -1,
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