import { Table, Column, Model } from 'sequelize-typescript';
@Table({
    tableName: 't_user_info',
    timestamps: false,
})
export default class _AutoUserInfo extends Model<_AutoUserInfo> {
    @Column({
      primaryKey: true,
    })
    id: number;

    @Column
    account: string;

    @Column
    password: string;

    @Column
    nickname: string;

    @Column
    editDate: Date;

    @Column
    createDate: Date;

    @Column
    remark: string;

}
export type _AutoUserInfoDataType = {
    id?: number;

    account?: string;

    password?: string;

    nickname?: string;

    editDate?: Date;

    createDate?: Date;

    remark?: string;

}
