import { RequestHandler } from 'express';

import { transaction } from '@/_system/dbMongo';
import { error } from '@/_system/common';
import * as config from '@/config';
import { myEnum } from '@/config';
import { responseHandler, paramsValid } from '@/helpers';
import * as VaildSchema from '@/vaild-schema/class-valid';
import { VoteModel, VoteMapper } from '@/models/mongo/vote';

export let submit: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, VaildSchema.VoteSubmit);
        let owner = await VoteMapper.findOwner({ ownerId: data.ownerId, type: data.type });
        let detail = await VoteMapper.create({ ownerId: data.ownerId, userId: user._id, type: data.type });
        //没变化，返回最新的数据
        if (data.value == detail.value) {
            return {
                like: owner.like,
                dislike: owner.dislike
            };
        }

        let map = {
            [myEnum.voteValue.喜欢]: 'like',
            [myEnum.voteValue.不喜欢]: 'dislike',
        };
        let updateOwner: any = {};
        let key = map[data.value];
        if (detail.value == myEnum.voteValue.无) {
            updateOwner[key] = owner[key] + 1;
        } else {
            if (key)
                updateOwner[key] = owner[key] + 1;
            let key2 = map[detail.value];
            updateOwner[key2] = owner[key2] - 1;
        }
        detail.value = data.value;
        await transaction(async (session) => {
            await owner.update(updateOwner, { session });
            await detail.save({ session });
        });
        return updateOwner;
    }, req, res);
};