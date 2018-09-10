import { Table, Column, Model } from 'sequelize-typescript';
@Table({
    tableName: 't_main_content_child',
    timestamps: false,
})
export default class _AutoMainContentChild extends Model<_AutoMainContentChild> {
    @Column({
      primaryKey: true,
    })
    id: number;

    @Column
    num: number;

    @Column
    mainContentId: number;

    @Column
    type: number;

    @Column
    content: string;

}
export type _AutoMainContentChildDataType = {
    id?: number;

    num?: number;

    mainContentId?: number;

    type?: number;

    content?: string;

}
