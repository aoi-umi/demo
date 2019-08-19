import { Transform, Type } from "class-transformer";
import { IsDefined, MinLength, MaxLength, IsIn } from "class-validator";
import { Types } from 'mongoose';
import { myEnum } from "../../config";

export class FollowSave {
    @IsDefined()
    @Transform(value => Types.ObjectId(value))
    userId: Types.ObjectId;

    @IsDefined()
    @IsIn([myEnum.followStatus.已关注, myEnum.followStatus.已取消])
    @Type()
    status: number;
}