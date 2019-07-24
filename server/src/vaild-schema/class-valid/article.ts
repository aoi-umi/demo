import { IsArray, IsDefined, ArrayMinSize, MinLength, IsIn } from "class-validator";
import { Types } from 'mongoose';
import { Type } from "class-transformer";

import { myEnum } from "../../config";
import { ListBase, DelBase, DetailQueryBase } from "./base";

export class AritcleQuery extends ListBase {
    _id: string;
    title: string;
    user: string;
    anyKey: string;
    status: string;
}

export class AritcleDetailQuery extends DetailQueryBase {
}

export class AritcleSave {

    _id?: string;

    @IsDefined()
    @MinLength(1)
    title: string;

    @IsDefined()
    @MinLength(1)
    content: string;

    @Type()
    submit?: boolean;
}

export class ArticleDel extends DelBase {
}

export class ArticleMgtAudit {
    @IsDefined()
    @Type(() => Types.ObjectId)
    idList: Types.ObjectId[];

    @IsDefined()
    @IsIn([myEnum.articleStatus.审核通过, myEnum.articleStatus.审核不通过])
    @Type()
    status: number;
}