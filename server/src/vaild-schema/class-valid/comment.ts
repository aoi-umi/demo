import { Transform, Type } from "class-transformer";
import { IsDefined, MinLength, MaxLength, IsIn } from "class-validator";
import { Types } from 'mongoose';
import { ListBase, DelBase } from "./base";
import { myEnum } from "../../config";

export class CommentSubmit {
    @IsDefined()
    @Transform(value => Types.ObjectId(value))
    ownerId: Types.ObjectId;

    @IsDefined()
    @MinLength(1)
    // @MaxLength(1024)
    comment: string;

    @Transform(value => Types.ObjectId(value))
    quotId: Types.ObjectId;

    @IsDefined()
    @IsIn(myEnum.commentType.getAllValue())
    @Type()
    type: number;
}

export class CommentQuery extends ListBase {
    @IsDefined()
    @Transform(value => Types.ObjectId(value))
    ownerId: Types.ObjectId;

    @Type()
    type: number;
}

export class CommentDel extends DelBase {
}