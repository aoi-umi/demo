import { IsArray, IsDefined, ArrayMinSize, MinLength } from "class-validator";
import { Type } from "class-transformer";
import { ListBase, DelBase } from "./base";

export class UserAccountExists {
    @IsDefined()
    @MinLength(1)
    account: string;
}

export class UserSignUp {
    @IsDefined()
    nickname: string;

    @IsDefined()
    account: string;

    @IsDefined()
    password: string;
}

export class UserSignIn {
    @IsDefined()
    account: string;

    @IsDefined()
    rand: string;
}

export class UserUpdate {
    newPassword: string;

    rand: string;

    token: string;
}

export class UserMgtQuery extends ListBase {
    _id?: string;
    account?: string;
    nickname?: string;
    authority?: string;
    role?: string;
    anyKey?: string;

    @Type()
    //包含已删除的权限角色
    includeDelAuth?: boolean;
}

export class UserMgtSave {
    _id?: string;

    @IsArray()
    delAuthList?: string[];

    @IsArray()
    addAuthList?: string[];

    @IsArray()
    delRoleList?: string[];

    @IsArray()
    addRoleList?: string[];
}

export class UserMgtDisable {
    _id: string;

    @Type()
    disabled?: boolean;

    //disabled为true, 不传时为永封
    disabledTo?: string;
}