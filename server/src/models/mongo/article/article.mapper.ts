import { error } from '../../../_system/common';
import { ArticleModel } from "./article";

export class ArticleMapper {
    static async findOne(data) {
        let detail = await ArticleModel.findOne(data);
        if (!detail)
            throw error('not exists');
        return detail;
    }
};