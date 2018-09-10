import { Table, Column, Model } from 'sequelize-typescript';
@Table({
    tableName: 't_user_info_with_authority',
    timestamps: false,
})
export default class _AutoUserInfoWithAuthority extends Model<_AutoUserInfoWithAuthority> {
    @Column({
      primaryKey: true,
    })
    id: number;

    @Column
    userInfoId: number;

    @Column
    authorityCode: string;

}
export type _AutoUserInfoWithAuthorityDataType = {
    id?: number;

    userInfoId?: number;

    authorityCode?: string;

}
