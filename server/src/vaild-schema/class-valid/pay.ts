import { IsDefined, IsIn, IsNumber, IsDecimal } from "class-validator";
import { Type } from "class-transformer";

import { myEnum } from "../../config";
import { ListBase } from "./base";

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
}

export class PayQuery extends ListBase { }