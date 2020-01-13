import { IsDefined } from "class-validator";

export class WxGetUserInfo {
    @IsDefined()
    code: string;
}