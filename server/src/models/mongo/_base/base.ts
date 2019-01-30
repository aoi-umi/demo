import {
    Model, ModelType, DocType, InstanceType,
    setSchema, setStatic,
} from 'mongoose-ts-ua';
import * as Q from 'q';

export type BaseInstanceType = InstanceType<Base>;
export type BaseModelType = ModelType<Base, typeof Base>;
export type BaseDocType = DocType<BaseInstanceType>;
@setSchema()
export class Base extends Model<Base> {
    @setStatic
    static async findAndCountAll(options: {
        conditions?: any,
        sort?: any,
        page: number,
        rows: number
    }) {
        let self = this as BaseModelType;
        let query = self.find(options.conditions).skip((options.page - 1) * options.rows).limit(options.rows);
        if (options.sort)
            query.sort(options.sort);
        let rs = await Q.all([
            query,
            self.find(options.conditions).countDocuments(),
        ]);
        return rs;
    }
}