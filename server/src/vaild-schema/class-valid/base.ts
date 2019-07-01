import { Type } from 'class-transformer';
import { IsIn, IsArray, IsDefined, ArrayMinSize } from "class-validator";

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

export class DelBase {
    @IsDefined()
    @IsArray()
    @ArrayMinSize(1)
    idList: string[];
}