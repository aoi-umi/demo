import * as mongoose from 'mongoose';
import { Types, Mongoose, ConnectionOptions, SchemaTypeOpts, Schema, SchemaType } from 'mongoose';
import { Typegoose, GetModelForClassOptions, InstanceType, prop as typegooseProp, PropOptionsWithValidate } from 'typegoose';
import * as  data_1 from 'typegoose/lib/data';
import { Omit, RecursivePartial } from 'sequelize-typescript/lib/utils/types';
Typegoose.prototype['setModelForClass'] = function (t, { existingMongoose, schemaOptions, existingConnection } = {}) {
    const name = this.constructor.name;
    //#region 多个模型继承同一parent, 会覆盖
    // // get schema of current model
    // let sch = this.buildSchema(name, schemaOptions);
    // // get parents class name
    // let parentCtor = Object.getPrototypeOf(this.constructor.prototype).constructor;
    // // iterate trough all parents
    // while (parentCtor && parentCtor.name !== 'Typegoose' && parentCtor.name !== 'Object') {
    //     // extend schema
    //     sch = this.buildSchema(parentCtor.name, schemaOptions, sch);
    //     // next parent
    //     parentCtor = Object.getPrototypeOf(parentCtor.prototype).constructor;
    // }
    //#endregion
    //#region 新的继承
    let className = [];
    let parentCtor = Object.getPrototypeOf(this.constructor.prototype).constructor
    while (parentCtor && parentCtor.name !== 'Typegoose' && parentCtor.name !== 'Object') {
        className.unshift(parentCtor.name);
        parentCtor = Object.getPrototypeOf(parentCtor.prototype).constructor;
    }
    let extendList = [
        data_1.methods.staticMethods,
        data_1.methods.instanceMethods,
        data_1.hooks,
        data_1.plugins,
        data_1.virtuals,
    ];
    //放在最后
    let clone = [];
    extendList.forEach(ele => {
        clone.push(ele[name]);
    });
    //合并父类
    className.forEach(key => {
        extendList.forEach(ele => {
            if (ele[key])
                ele[name] = Object.assign({}, ele[name], ele[key]);
        });
    });
    extendList.forEach((ele, idx) => {
        if (clone[idx])
            ele[name] = Object.assign({}, ele[name], clone[idx]);
    });

    let sch = this.buildSchema(name, schemaOptions);
    //#endregion

    let model = mongoose.model.bind(mongoose);
    if (existingConnection) {
        model = existingConnection.model.bind(existingConnection);
    }
    else if (existingMongoose) {
        model = existingMongoose.model.bind(existingMongoose);
    }
    data_1.models[name] = model(name, sch);
    data_1.constructors[name] = this.constructor;
    return data_1.models[name];
}

type DefaultInstance = mongoose.Document & Typegoose;
export declare type ModelType<T, typeofT> = mongoose.Model<InstanceType<T>> & typeofT;

export type FilteredModelAttributes<T extends DefaultInstance> =
    RecursivePartial<Omit<T, keyof DefaultInstance>> & {
        _id: Types.ObjectId;
    };

export type DocType<T extends DefaultInstance> = FilteredModelAttributes<T>;
declare module "mongoose" {
    interface Document {
        _doc: DocType<this & Typegoose>;
    }
}
export class Model<T> extends Typegoose {
    createdAt?: Date;
    updatedAt?: Date;
}

export function getModelForClass<T extends Typegoose, typeofT>(t: { new(): T }, getModelForClassOptions?: GetModelForClassOptions) {
    const model = new t().getModelForClass(t, getModelForClassOptions) as any as Typegoose & mongoose.Model<InstanceType<T>> & typeofT;
    return model;
}

/**
 * 
 * @param uris 'mongodb://localhost:27017/test'
 */
export function connect(uris: string, { existingMongoose, mongooseOption }: {
    existingMongoose?: Mongoose,
    mongooseOption?: ConnectionOptions
} = {}) {
    return (existingMongoose || mongoose).connect(uris, { useNewUrlParser: true, ...mongooseOption });
}

export function prop(options?: (SchemaTypeOpts<any> | Schema | SchemaType) & PropOptionsWithValidate) {
    return typegooseProp(options);
};