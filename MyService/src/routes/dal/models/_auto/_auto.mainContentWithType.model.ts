import { Table, Column, Model } from 'sequelize-typescript';
@Table({
    tableName: 't_main_content_with_type',
    timestamps: false,
})
export default class _AutoMainContentWithType extends Model<_AutoMainContentWithType> {
    @Column({
      primaryKey: true,
    })
    id: number;

    @Column
    mainContentId: number;

    @Column
    mainContentType: string;

    @Column
    mainContentTypeName: string;

}
export type _AutoMainContentWithTypeDataType = {
    id?: number;

    mainContentId?: number;

    mainContentType?: string;

    mainContentTypeName?: string;

}
