import { Table, Column, Model } from 'sequelize-typescript';
@Table({
    tableName: 't_main_content_type',
    timestamps: false,
})
export default class _AutoMainContentType extends Model<_AutoMainContentType> {
    @Column({
      primaryKey: true,
    })
    id: number;

    @Column
    type: string;

    @Column
    typeName: string;

    @Column
    parentType: string;

    @Column
    level: number;

}
export type _AutoMainContentTypeDataType = {
    id?: number;

    type?: string;

    typeName?: string;

    parentType?: string;

    level?: number;

}
