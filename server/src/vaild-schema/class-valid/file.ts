import { IsDefined } from "class-validator";
import { Types } from 'mongoose';
import { Type } from "class-transformer";

export class FileGet {
    @IsDefined()
    @Type(() => Types.ObjectId)
    _id: Types.ObjectId;
}