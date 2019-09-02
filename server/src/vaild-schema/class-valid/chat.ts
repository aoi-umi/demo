import { Transform, Type } from "class-transformer";
import { IsDefined, MinLength, MaxLength, } from "class-validator";
import { Types } from 'mongoose';
import { ListBase } from "./base";

export class ChatSubmit {
    @IsDefined()
    @Transform(value => Types.ObjectId(value))
    destUserId: Types.ObjectId;

    @IsDefined()
    @MinLength(1)
    content: string;
}

export class ChatQuery extends ListBase {
    @Transform(value => Types.ObjectId(value))
    lastId: Types.ObjectId;

    @IsDefined()
    @Transform(value => Types.ObjectId(value))
    destUserId: Types.ObjectId;
}