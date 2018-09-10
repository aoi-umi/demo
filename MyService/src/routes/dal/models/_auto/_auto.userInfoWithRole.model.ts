import { Table, Column, Model } from 'sequelize-typescript';
@Table({
    tableName: 't_user_info_with_role',
    timestamps: false,
})
export default class _AutoUserInfoWithRole extends Model<_AutoUserInfoWithRole> {
    @Column({
      primaryKey: true,
    })
    id: number;

    @Column
    userInfoId: number;

    @Column
    roleCode: string;

}
export type _AutoUserInfoWithRoleDataType = {
    id?: number;

    userInfoId?: number;

    roleCode?: string;

}
