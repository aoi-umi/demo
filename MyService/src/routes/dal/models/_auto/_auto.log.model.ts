import { Table, Column, Model } from 'sequelize-typescript';
@Table({
    tableName: 't_log',
    timestamps: false,
})
export default class _AutoLog extends Model<_AutoLog> {
    @Column({
      primaryKey: true,
    })
    id: number;

    @Column
    application: string;

    @Column
    method: string;

    @Column
    methodName: string;

    @Column
    url: string;

    @Column
    result: number;

    @Column
    code: string;

    @Column
    req: string;

    @Column
    res: string;

    @Column
    ip: string;

    @Column
    createDate: Date;

    @Column
    remark: string;

    @Column
    guid: string;

    @Column
    duration: number;

    @Column
    requestIp: string;

}
export type _AutoLogDataType = {
    id?: number;

    application?: string;

    method?: string;

    methodName?: string;

    url?: string;

    result?: number;

    code?: string;

    req?: string;

    res?: string;

    ip?: string;

    createDate?: Date;

    remark?: string;

    guid?: string;

    duration?: number;

    requestIp?: string;

}
