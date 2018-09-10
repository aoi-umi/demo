import { Table, Column, Model } from 'sequelize-typescript';
@Table({
    tableName: 't_authority',
    timestamps: false,
})
export default class _AutoAuthority extends Model<_AutoAuthority> {
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
export type _AutoAuthorityDataType = {
    id?: number;

    code?: string;

    name?: string;

    status?: number;

}
