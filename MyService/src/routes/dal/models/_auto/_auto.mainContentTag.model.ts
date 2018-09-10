import { Table, Column, Model } from 'sequelize-typescript';
@Table({
    tableName: 't_main_content_tag',
    timestamps: false,
})
export default class _AutoMainContentTag extends Model<_AutoMainContentTag> {
    @Column({
      primaryKey: true,
    })
    id: number;

    @Column
    mainContentId: number;

    @Column
    name: string;

}
export type _AutoMainContentTagDataType = {
    id?: number;

    mainContentId?: number;

    name?: string;

}
