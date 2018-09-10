import { Table, Column, Model } from 'sequelize-typescript';
@Table({
    tableName: 't_main_content_type_id',
    timestamps: false,
})
export default class _AutoMainContentTypeId extends Model<_AutoMainContentTypeId> {
    @Column({
      primaryKey: true,
    })
    id: number;

    @Column
    mainContentId: number;

    @Column
    mainContentTypeId: number;

}
export type _AutoMainContentTypeIdDataType = {
    id?: number;

    mainContentId?: number;

    mainContentTypeId?: number;

}
