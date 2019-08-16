import { Transform, Type } from "class-transformer";
import { IsDefined, MinLength, MaxLength, IsIn } from "class-validator";
import { Types } from 'mongoose';
import { myEnum } from "../../config";

export class VoteSubmit {
    @IsDefined()
    @Transform(value => Types.ObjectId(value))
    ownerId: Types.ObjectId;

    @IsDefined()
    @IsIn(myEnum.voteType.getAllValue())
    @Type()
    type: number;

    @IsDefined()
    @IsIn(myEnum.voteValue.getAllValue())
    @Type()
    value: number;
}