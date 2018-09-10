import { Table, Column, Model } from 'sequelize-typescript';
@Table({
    tableName: 't_struct',
    timestamps: false,
})
export default class _AutoStruct extends Model<_AutoStruct> {
    @Column({
      primaryKey: true,
    })
    id: number;

    @Column
    type: string;

    @Column
    struct: string;

    @Column
    structName: string;

    @Column
    parentStruct: string;

    @Column
    level: number;

}
export type _AutoStructDataType = {
    id?: number;

    type?: string;

    struct?: string;

    structName?: string;

    parentStruct?: string;

    level?: number;

}
