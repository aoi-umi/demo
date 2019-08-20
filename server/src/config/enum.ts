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
    articleStatus: {
        草稿: 0,
        待审核: 1,
        审核通过: 2,
        审核不通过: 3,
        已删除: -1,
    },
    commentType: {
        文章: 0,
        // 视频: 1,
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
    followQueryType: {
        关注: 1,
        粉丝: 2
    },

    socket: {
        弹幕发送: 'danmakuSend',
        弹幕接收: 'danmakuRecv'
    },
    fileType: {
        图片: 'image'
    }
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