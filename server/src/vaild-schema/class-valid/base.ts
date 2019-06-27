import { Type } from 'class-transformer';
import { IsIn, IsArray, IsDefined, ArrayMinSize } from "class-validator";

export class ListBase {
    @Type()
    page?: number;

    @Type()
    rows?: number;

    @IsIn([1, -1])
    @Type()
    orderBy?: number;
    sortOrder?: string;
    
    @Type()
    getAll?: boolean;
}

export class DelBase {
    @IsDefined()
    @IsArray()
    @ArrayMinSize(1)
    idList: string[];
}