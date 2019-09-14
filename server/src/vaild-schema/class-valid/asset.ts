import { ListBase } from "./base";

export class AssetNotifyQuery extends ListBase {
    orderNo: string;
    outOrderNo: string;
}

export class AssetLogQuery extends ListBase {
    orderNo: string;
    outOrderNo: string;
    status: string;
}