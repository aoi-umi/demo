import { IsDefined } from "class-validator";
import { Types } from 'mongoose';
import { Transform } from "class-transformer";

export class FileGet {
    @IsDefined()
    @Transform(value => Types.ObjectId(value))
    _id: Types.ObjectId;
}