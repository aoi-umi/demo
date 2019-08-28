import { Type, Transform } from 'class-transformer';
import { IsIn, IsArray, IsDefined, ArrayMinSize, IsInt } from "class-validator";
import { Types } from 'mongoose';

export class ListBase {
    @IsInt()
    @Type()
    page?: number;

    @IsInt()
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
    @Transform(value => Types.ObjectId(value))
    _id: Types.ObjectId;
}

export class DelBase {
    @IsDefined()
    @IsArray()
    @ArrayMinSize(1)
    @Transform(value => {
        return value.map(ele => Types.ObjectId(ele));
    })
    idList: Types.ObjectId[];
}