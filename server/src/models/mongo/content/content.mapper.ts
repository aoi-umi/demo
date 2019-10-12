import { Types } from 'mongoose';

import { myEnum } from '@/config';

import { LoginUser } from '../../login-user';
import { FileMapper } from '../file';

export type ContentResetOption = {
    user?: LoginUser,
    imgHost?: string;
};

export type ContentQueryOption<T extends ContentResetOption = ContentResetOption> = {
    audit?: boolean;
    normal?: boolean;
    userId?: Types.ObjectId;
    resetOpt: T;
};

export class ContentMapper {
    static resetDetail(detail, opt: ContentResetOption) {
        detail.coverUrl = FileMapper.getImgUrl(detail.cover, opt.imgHost);
        if (detail.user) {
            detail.user.avatarUrl = FileMapper.getImgUrl(detail.user.avatar, opt.imgHost);
            detail.user.followStatus = detail.follow ? detail.follow.status : myEnum.followStatus.未关注;
        }
        delete detail.follow;
        detail.voteValue = detail.vote ? detail.vote.value : myEnum.voteValue.无;
        delete detail.vote;
        return detail;
    }
}