import { Table, Column, Model } from 'sequelize-typescript';
@Table({
    tableName: 't_user_info_log',
    timestamps: false,
})
export default class _AutoUserInfoLog extends Model<_AutoUserInfoLog> {
    @Column({
      primaryKey: true,
    })
    id: number;

    @Column
    userInfoId: number;

    @Column
    type: number;

    @Column
    content: string;

    @Column
    createDate: Date;

}
export type _AutoUserInfoLogDataType = {
    id?: number;

    userInfoId?: number;

    type?: number;

    content?: string;

    createDate?: Date;

}
