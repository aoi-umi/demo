import { IsDefined, IsIn, IsNumber, IsDecimal } from "class-validator";
import { Type, Transform } from "class-transformer";
import { Types } from 'mongoose';

import { myEnum } from "../../config";
import { ListBase } from "./base";
import { objectIdTransform } from "./util";

export class PayCreate {
    // @IsDecimal({
    //     decimal_digits: '0,2'
    // })
    @IsNumber()
    @IsDefined()
    @Type()
    money: number;

    @IsDefined()
    @IsIn(myEnum.assetSourceType.getAllValue())
    @Type()
    type: number;

    title?: string;
    content?: string;
}

export class PaySubmit {
    @IsDefined()
    @Transform(objectIdTransform)
    _id: Types.ObjectId;
}

export class PayCancel {
    @IsDefined()
    @Transform(objectIdTransform)
    _id: Types.ObjectId;
}

export class PayQuery extends ListBase {
    status?: string;
    type?: string;
    orderNo?: string;
    outOrderNo?: string;
    anyKey?: string;
}