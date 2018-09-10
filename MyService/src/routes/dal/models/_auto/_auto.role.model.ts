import { Table, Column, Model } from 'sequelize-typescript';
@Table({
    tableName: 't_role',
    timestamps: false,
})
export default class _AutoRole extends Model<_AutoRole> {
    @Column({
      primaryKey: true,
    })
    id: number;

    @Column
    code: string;

    @Column
    name: string;

    @Column
    status: number;

}
export type _AutoRoleDataType = {
    id?: number;

    code?: string;

    name?: string;

    status?: number;

}
