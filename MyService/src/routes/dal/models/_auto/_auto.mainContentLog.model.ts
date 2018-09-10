import { Table, Column, Model } from 'sequelize-typescript';
@Table({
    tableName: 't_main_content_log',
    timestamps: false,
})
export default class _AutoMainContentLog extends Model<_AutoMainContentLog> {
    @Column({
      primaryKey: true,
    })
    id: number;

    @Column
    mainContentId: number;

    @Column
    type: number;

    @Column
    srcStatus: string;

    @Column
    destStatus: string;

    @Column
    content: string;

    @Column
    createDate: Date;

    @Column
    operateDate: Date;

    @Column
    operatorId: number;

    @Column
    operator: string;

}
export type _AutoMainContentLogDataType = {
    id?: number;

    mainContentId?: number;

    type?: number;

    srcStatus?: string;

    destStatus?: string;

    content?: string;

    createDate?: Date;

    operateDate?: Date;

    operatorId?: number;

    operator?: string;

}
