import { ListBase, DelBase } from "./base";
import { IsArray, IsDefined, ArrayMinSize, MinLength } from "class-validator";

export class AuthorityQuery extends ListBase {
    code: string;
    name: string;
    status: string;
    anyKey: string;
}

export class AuthorityCodeExists {

    _id?: string;

    @IsDefined()
    @MinLength(1)
    code: string;
}

export class AuthorityDel extends DelBase {
}