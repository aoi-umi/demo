﻿import * as db from '../_system/db';
import { Transaction } from '../_system/db';
import { MainContentDataType } from './models/dbModel/MainContent';
import { MainContentWithTypeModel, MainContentChildModel, MainContentLogModel } from './models/dbModel';
import { QueryOptions } from '../bll/_auto';
type MainContentWithTypeDataType = MainContentWithTypeModel.MainContentWithTypeDataType;
type MainContentChildDataType = MainContentChildModel.MainContentChildDataType;
type MainContentLogDataType = MainContentLogModel.MainContentLogDataType;

export type _DetailQueryOptions = {
    id?: number;
    noLog?: boolean;
}
export let detailQuery = async function (params: _DetailQueryOptions, conn?: Transaction) {
    var sql = 'call p_main_content_detail_query(:id, :noLog)';
    let t = await db.query(sql, params, conn);
    let data = {
        mainContent: t[0][0] as MainContentDataType & { nickname: string, account: string },
        mainContentTypeList: t[1] as (MainContentWithTypeDataType & { mainContentType: string, mainContentName: string })[],
        mainContentChildList: t[2] as MainContentChildDataType[],
        mainContentLogList: t[3] as MainContentLogDataType[]
    };
    return {
        rawData: t,
        data
    };
};
export type _QueryOptions = QueryOptions<MainContentDataType & {
    createDateStart?: string;
    createDateEnd?: string;
    operateDateStart?: string;
    operator?: string;
}>
export let query = async function (params: _QueryOptions, conn?: Transaction) {
    var sql = 'call p_main_content_query(:id, :type, :status, :user, :title, :description, :createDateStart, :createDateEnd, :operateDateStart, :operateDateEnd, :operator, :nullList, :pageIndex, :pageSize)';
    let t = await db.query(sql, params, conn);
    var data = {
        list: t[0] as MainContentDataType[],
        count: t[1][0].count as number,
        statusList: t[2] as { status: number, count: number }[]
    };
    return {
        rawData: t,
        data
    };
};

