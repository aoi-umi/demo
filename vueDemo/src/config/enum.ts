import { Enum } from 'enum-ts';
const contentStatus = {
    草稿: 0,
    待审核: 1,
    审核通过: 2,
    审核不通过: 3,
    已删除: -1,
};
const enumDefine = {
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
    articleStatus: contentStatus,
    videoStatus: contentStatus,
    contentType: {
        文章: 0,
        视频: 1,
    },
    commentStatus: {
        正常: 0,
        已删除: -1
    },
    voteType: {
        文章: 0,
        视频: 1,
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
    assetSourceType: {
        微信: 1,
        支付宝: 2,
    },
    assetType: {
        支付: 1,
        退款: 2,
    },
    assetLogStatus: {
        未完成: 0,
        已完成: 1,
    },
    payStatus: {
        未支付: 0,
        待处理: 1,
        已支付: 2,
        已取消: -1,
    },
    payRefundStatus: {
        未退款: 0,
        已申请: 1,
        已退款: 2,
    },
    notifyType: {
        微信: 1,
        支付宝: 2,
    },

    socket: {
        弹幕发送: 'danmakuSend',
        弹幕接收: 'danmakuRecv',
        登录: 'login',
        登出: 'logout',
        私信接收: 'chatRecv',
    },
    fileType: {
        图片: 'image',
        视频: 'video'
    }
};

const enumDefineFront = {
    contentMgtType: {
        文章: 'article',
        视频: 'video',
    },
    userEditType: {
        修改: 'edit',
        封禁: 'disable',
    },
    userDisableType: {
        解封: 0,
        封禁至: 1,
    },
    userTab: {
        粉丝: 'follower',
        关注: 'following',
        文章: 'article',
        私信: 'chat',
    },
    chatSendStatus: {
        发送中: 0,
        发送成功: 1,
        发送失败: -1
    }
};
export const enumDef = {
    ...enumDefine,
    ...enumDefineFront
};
export const myEnum = Enum.createInstance(enumDef);