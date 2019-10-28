import { Transform, Type } from "class-transformer";
import { IsDefined, IsIn, IsArray, ArrayMinSize, ValidateNested } from "class-validator";
import { Types } from 'mongoose';
import { myEnum } from "@/config";
import { objectIdTransform } from "./util";
import { DetailQueryBase, ListBase } from "./base";

class Spu {
    @Transform(objectIdTransform)
    _id: Types.ObjectId;

    @IsDefined()
    name: string;

    @IsDefined()
    profile: string;

    @IsDefined()
    @IsArray()
    @ArrayMinSize(1)
    imgs: string[];

    @IsDefined()
    @IsIn(myEnum.goodsStatus.getAllValue())
    @Type()
    status: number;

    @Type()
    putOnAt: Date;

    @Type()
    expireAt: Date;
}

class SpecGroup {
    @IsDefined()
    name: string;

    @IsDefined()
    @IsArray()
    @ArrayMinSize(1)
    value: string[];
}

class Sku {
    @IsDefined()
    spec: string[];

    @IsDefined()
    code: string;

    @IsDefined()
    @IsIn(myEnum.goodsSkuStatus.getAllValue())
    @Type()
    status: number;

    @IsDefined()
    @Type()
    price: number;

    @IsDefined()
    @Type()
    quantity: number;

    imgs: string[];
}

export class GoodsSave {
    @ValidateNested()
    @IsDefined()
    @Type(() => Spu)
    spu: Spu;

    @ValidateNested()
    @IsDefined()
    @IsArray()
    @ArrayMinSize(1)
    @Type(() => SpecGroup)
    specGroup: SpecGroup[];

    @ValidateNested()
    @IsDefined()
    @IsArray()
    @ArrayMinSize(1)
    @Type(() => Sku)
    sku: Sku[];
}

export class GoodsDetailQuery extends DetailQueryBase {
}

export class GoodsQuery extends ListBase {
    status: string;
    name: string;
}