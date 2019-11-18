import { RequestHandler } from 'express';

import { transaction } from '@/_system/dbMongo';
import { error } from '@/_system/common';
import * as config from '@/config';
import { myEnum } from '@/config';
import { responseHandler, paramsValid } from '@/helpers';
import * as ValidSchema from '@/valid-schema/class-valid';
import { FavouriteMapper } from '@/models/mongo/favourite';

export let submit: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, ValidSchema.FavouriteSubmit);
        let owner = await FavouriteMapper.findOwner({ ownerId: data.ownerId, type: data.type });
        let detail = await FavouriteMapper.create({ ownerId: data.ownerId, userId: user._id, type: data.type });
        //没变化，返回最新的数据
        if (data.favourite == detail.favourite) {
            return {
                favourite: owner.favourite,
            };
        }

        let updateOwner: any = {};
        updateOwner.favourite = owner.favourite + (data.favourite ? 1 : -1);
        detail.favourite = data.favourite;
        await transaction(async (session) => {
            await owner.update(updateOwner, { session });
            await detail.save({ session });
        });
        return updateOwner;
    }, req, res);
};

export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let myData = req.myData;
        let user = myData.user;
        let data = paramsValid(req.query, ValidSchema.FavouriteQuery);
        let { rows, total } = await FavouriteMapper.query(data, { user, imgHost: myData.imgHost });
        return {
            rows,
            total,
        };
    }, req, res);
};