import { Table, Column, Model } from 'sequelize-typescript';
@Table({
    tableName: 't_main_content',
    timestamps: false,
})
export default class _AutoMainContent extends Model<_AutoMainContent> {
    @Column({
      primaryKey: true,
    })
    id: number;

    @Column
    type: number;

    @Column
    status: number;

    @Column
    userInfoId: number;

    @Column
    userInfo: string;

    @Column
    title: string;

    @Column
    description: string;

    @Column
    createDate: Date;

    @Column
    operateDate: Date;

    @Column
    operator: string;

}
export type _AutoMainContentDataType = {
    id?: number;

    type?: number;

    status?: number;

    userInfoId?: number;

    userInfo?: string;

    title?: string;

    description?: string;

    createDate?: Date;

    operateDate?: Date;

    operator?: string;

}
