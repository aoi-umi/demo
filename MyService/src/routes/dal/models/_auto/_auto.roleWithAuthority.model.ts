import { Table, Column, Model } from 'sequelize-typescript';
@Table({
    tableName: 't_role_with_authority',
    timestamps: false,
})
export default class _AutoRoleWithAuthority extends Model<_AutoRoleWithAuthority> {
    @Column({
      primaryKey: true,
    })
    id: number;

    @Column
    roleCode: string;

    @Column
    authorityCode: string;

}
export type _AutoRoleWithAuthorityDataType = {
    id?: number;

    roleCode?: string;

    authorityCode?: string;

}
