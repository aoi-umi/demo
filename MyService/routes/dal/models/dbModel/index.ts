//封装一层，外部不直接调用_auto文件
//扩展的方法写到该类

export { Authority } from './Authority';
export { Log } from './Log';
export { MainContent } from './MainContent';
export { Role } from './Role';
export { UserInfo } from './UserInfo';
export { UserInfoWithStruct } from './UserInfoWithStruct';

import _AutoMainContentChild from "../_auto/_auto.mainContentChild.model";
export class MainContentChild extends _AutoMainContentChild { };

import _AutoMainContentLog from "../_auto/_auto.mainContentLog.model";
export class MainContentLog extends _AutoMainContentLog { };

import _AutoMainContentTag from "../_auto/_auto.mainContentTag.model";
export class MainContentTag extends _AutoMainContentTag { };

import _AutoMainContentType from "../_auto/_auto.mainContentType.model";
export class MainContentType extends _AutoMainContentType { };

import _AutoMainContentTypeId from "../_auto/_auto.mainContentTypeId.model";
export class MainContentTypeId extends _AutoMainContentTypeId { };

import _AutoMainContentWithType from "../_auto/_auto.mainContentWithType.model";
export class MainContentWithType extends _AutoMainContentWithType { };

import _AutoRoleWithAuthority from "../_auto/_auto.roleWithAuthority.model";
export class RoleWithAuthority extends _AutoRoleWithAuthority { };

import _AutoStruct from "../_auto/_auto.struct.model";
export class Struct extends _AutoStruct { };

import _AutoUserInfoLog from "../_auto/_auto.userInfoLog.model";
export class UserInfoLog extends _AutoUserInfoLog { };

import _AutoUserInfoWithAuthority from "../_auto/_auto.userInfoWithAuthority.model";
export class UserInfoWithAuthority extends _AutoUserInfoWithAuthority { };

import _AutoUserInfoWithRole from "../_auto/_auto.userInfoWithRole.model";
export class UserInfoWithRole extends _AutoUserInfoWithRole { };


