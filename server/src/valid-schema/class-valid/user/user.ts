import { IsArray, IsDefined, ArrayMinSize, MinLength } from "class-validator";
import { Type, Transform } from "class-transformer";
import { ListBase, DelBase, DetailQueryBase } from "../base";
import { objectIdTransform } from "../util";

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

export class UserDetailQuery extends DetailQueryBase {
}

export class UserMgtQuery extends ListBase {
    @Transform(objectIdTransform)
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
    @IsDefined()
    @Transform(objectIdTransform)
    _id: string;

    @IsArray()
    delAuthList?: string[];

    @IsArray()
    addAuthList?: string[];

    @IsArray()
    delRoleList?: string[];

    @IsArray()
    addRoleList?: string[];

    password?: string;
}

export class UserMgtDisable {
    @IsDefined()
    @Transform(objectIdTransform)
    _id: string;

    @Type()
    disabled?: boolean;

    //disabled为true, 不传时为永封
    disabledTo?: string;
}