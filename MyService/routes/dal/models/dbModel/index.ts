//封装一层，外部不直接调用_auto文件
//扩展的方法写到该类

import * as AuthorityModel from './Authority';
export { AuthorityModel };

import * as LogModel from './Log';
export { LogModel };

import * as MainContentModel from './MainContent';
export { MainContentModel };

import * as RoleModel from './Role';
export { RoleModel };

import * as UserInfoModel from './UserInfo';
export { UserInfoModel };

import * as  UserInfoWithStructModel from './UserInfoWithStruct';
export { UserInfoWithStructModel };


import _AutoMainContentChild, { _AutoMainContentChildDataType } from "../_auto/_auto.mainContentChild.model";
export namespace MainContentChildModel {
    export class MainContentChild extends _AutoMainContentChild { };
    export type MainContentChildDataType = _AutoMainContentChildDataType;
}

import _AutoMainContentLog, { _AutoMainContentLogDataType } from "../_auto/_auto.mainContentLog.model";
export namespace MainContentLogModel {
    export class MainContentLog extends _AutoMainContentLog { };
    export type MainContentLogDataType = _AutoMainContentLogDataType;
}

import _AutoMainContentTag, { _AutoMainContentTagDataType } from "../_auto/_auto.mainContentTag.model";
export namespace MainContentTagModel {
    export class MainContentTag extends _AutoMainContentTag { };
    export type MainContentTagDataType = _AutoMainContentTagDataType;
}

import _AutoMainContentType, { _AutoMainContentTypeDataType } from "../_auto/_auto.mainContentType.model";
export namespace MainContentTypeModel {
    export class MainContentType extends _AutoMainContentType { };
    export type MainContentTypeDataType = _AutoMainContentTypeDataType;
}

import _AutoMainContentTypeId, { _AutoMainContentTypeIdDataType } from "../_auto/_auto.mainContentTypeId.model";
export namespace MainContentTypeIdModel {
    export class MainContentTypeId extends _AutoMainContentTypeId { };
    export type MainContentTypeIdDataType = _AutoMainContentTypeIdDataType;
}

import _AutoMainContentWithType, { _AutoMainContentWithTypeDataType } from "../_auto/_auto.mainContentWithType.model";
export namespace MainContentWithTypeModel {
    export class MainContentWithType extends _AutoMainContentWithType { };
    export type MainContentWithTypeDataType = _AutoMainContentWithTypeDataType;
}

import _AutoRoleWithAuthority, { _AutoRoleWithAuthorityDataType } from "../_auto/_auto.roleWithAuthority.model";
export namespace RoleWithAuthorityModel {
    export class RoleWithAuthority extends _AutoRoleWithAuthority { };
    export type RoleWithAuthorityDataType = _AutoRoleWithAuthorityDataType;
}

import _AutoStruct, { _AutoStructDataType } from "../_auto/_auto.struct.model";
export namespace StructModel {
    export class Struct extends _AutoStruct { };
    export type StructDataType = _AutoStructDataType;
}

import _AutoUserInfoLog, { _AutoUserInfoLogDataType } from "../_auto/_auto.userInfoLog.model";
export namespace UserInfoLogModel {
    export class UserInfoLog extends _AutoUserInfoLog { };
    export type UserInfoLogDataType = _AutoUserInfoLogDataType;
}

import _AutoUserInfoWithAuthority, { _AutoUserInfoWithAuthorityDataType } from "../_auto/_auto.userInfoWithAuthority.model";
export namespace UserInfoWithAuthorityModel {
    export class UserInfoWithAuthority extends _AutoUserInfoWithAuthority { };
    export type UserInfoWithAuthorityDataType = _AutoUserInfoWithAuthorityDataType;
}

import _AutoUserInfoWithRole, { _AutoUserInfoWithRoleDataType } from "../_auto/_auto.userInfoWithRole.model";
import { userInfo } from 'os';
export namespace UserInfoWithRoleModel {
    export class UserInfoWithRole extends _AutoUserInfoWithRole { };
    export type UserInfoWithRoleDataType = _AutoUserInfoWithRoleDataType;
}





