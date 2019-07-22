import { Type } from 'class-transformer';
import { IsIn, IsArray, IsDefined, ArrayMinSize } from "class-validator";
import { Types } from 'mongoose';

export class ListBase {
    @Type()
    page?: number;

    @Type()
    rows?: number;

    orderBy?: string;

    @IsIn([1, -1, 0])
    @Type()
    sortOrder?: number;

    @Type()
    getAll?: boolean;
}

export class DetailQueryBase {
    @IsDefined()
    @Type()
    _id: Types.ObjectId;
}

export class DelBase {
    @IsDefined()
    @IsArray()
    @ArrayMinSize(1)
    @Type(() => Types.ObjectId)
    idList: Types.ObjectId[];
}