import {
    getModelForClass, ModelType, DocType, InstanceType,
    setSchema, prop, arrayProp
} from 'mongoose-ts-ua';
import { Base } from '../_base';
import { myEnum } from '../../../config/enum';

export type RoleInstanceType = InstanceType<Role>;
export type RoleModelType = ModelType<Role, typeof Role>;
export type RoleDocType = DocType<RoleInstanceType>;
@setSchema({
    schemaOptions: {}
})
export class Role extends Base {
    @prop({
        required: true,
        trim: true,
    })
    name: string;

    @prop({
        required: true,
        trim: true,
        index: {
            unique: true
        }
    })
    code: string;

    @prop({
        enum: myEnum.roleStatus.getAllValue(),
        default: myEnum.roleStatus.启用,
    })
    status: number;

    @arrayProp({
        type: String,
    })
    authorityList: string[];
}

export const RoleModel = getModelForClass<Role, typeof Role>(Role);

