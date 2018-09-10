import { Table, Column, Model } from 'sequelize-typescript';
@Table({
    tableName: 't_user_info_with_struct',
    timestamps: false,
})
export default class _AutoUserInfoWithStruct extends Model<_AutoUserInfoWithStruct> {
    @Column({
      primaryKey: true,
    })
    id: number;

    @Column
    userInfoId: number;

    @Column
    struct: string;

}
export type _AutoUserInfoWithStructDataType = {
    id?: number;

    userInfoId?: number;

    struct?: string;

}
