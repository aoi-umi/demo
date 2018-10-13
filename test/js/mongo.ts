import * as mongoose from 'mongoose';
import { Types, Mongoose, ConnectionOptions, SchemaTypeOpts, Schema, SchemaType, SchemaOptions } from 'mongoose';
import { Typegoose, GetModelForClassOptions, InstanceType, PropOptionsWithValidate, ModelType as typegooseModelType, ArrayPropOptions, PropOptionsWithStringValidate, PropOptionsWithNumberValidate } from 'typegoose';

import * as _ from 'lodash';
import { schema, models, methods, virtuals, hooks, plugins, constructors } from 'typegoose/lib/data';
import { isPrimitive, initAsObject, initAsArray, isString, isNumber, isObject } from 'typegoose/lib//utils';
import { InvalidPropError, NotNumberTypeError, NotStringTypeError, NoMetadataError } from 'typegoose/lib/errors';

import { Omit, RecursivePartial } from 'sequelize-typescript/lib/utils/types';
let newSchema = {};
let instanceTypegoose = new Typegoose();

//#region setModelForClass 

Typegoose.prototype.setModelForClass = function <T>(t: T, { existingMongoose, schemaOptions, existingConnection }: GetModelForClassOptions = {}) {
    const name = this.constructor.name;
    //#region
    // get schema of current model
    // let sch = this.buildSchema(name, schemaOptions);
    // // get parents class name
    // let parentCtor = Object.getPrototypeOf(this.constructor.prototype).constructor;
    // // iterate trough all parents
    // while (parentCtor && parentCtor.name !== 'Typegoose' && parentCtor.name !== 'Object') {
    //   // extend schema
    //   sch = this.buildSchema(parentCtor.name, schemaOptions, sch);
    //   // next parent
    //   parentCtor = Object.getPrototypeOf(parentCtor.prototype).constructor;
    // }
    //#endregion

    let model = mongoose.model.bind(mongoose);
    if (existingConnection) {
        model = existingConnection.model.bind(existingConnection);
    } else if (existingMongoose) {
        model = existingMongoose.model.bind(existingMongoose);
    }
    //new 
    let sch: Schema = newSchema[name];

    models[name] = model(name, sch);
    constructors[name] = this.constructor;

    return models[name];// as typegooseModelType<this> & T;
}
//#endregion

//#region prop 
const isWithStringValidate = (options: PropOptionsWithStringValidate) =>
    (options.minlength || options.maxlength || options.match);

const isWithNumberValidate = (options: PropOptionsWithNumberValidate) =>
    (options.min || options.max);

const baseProp = (rawOptions, Type, target, key, isArray = false) => {
    const name = target.constructor.name;
    const isGetterSetter = Object.getOwnPropertyDescriptor(target, key);
    if (isGetterSetter) {
        if (isGetterSetter.get) {
            if (!virtuals[name]) {
                virtuals[name] = {};
            }
            if (!virtuals[name][key]) {
                virtuals[name][key] = {};
            }
            virtuals[name][key] = {
                ...virtuals[name][key],
                get: isGetterSetter.get,
            };
        }

        if (isGetterSetter.set) {
            if (!virtuals[name]) {
                virtuals[name] = {};
            }
            if (!virtuals[name][key]) {
                virtuals[name][key] = {};
            }
            virtuals[name][key] = {
                ...virtuals[name][key],
                set: isGetterSetter.set,
            };
        }
        return;
    }

    if (isArray) {
        initAsArray(name, key);
    } else {
        initAsObject(name, key);
    }

    const ref = rawOptions.ref;
    if (ref) {
        schema[name][key] = {
            ...schema[name][key],
            type: mongoose.Schema.Types.ObjectId,
            ref: ref.name,
        };
        return;
    }

    const itemsRef = rawOptions.itemsRef;
    if (itemsRef) {
        schema[name][key][0] = {
            ...schema[name][key][0],
            type: mongoose.Schema.Types.ObjectId,
            ref: itemsRef.name,
        };
        return;
    }

    const enumOption = rawOptions.enum;
    if (enumOption) {
        if (!Array.isArray(enumOption)) {
            rawOptions.enum = Object.keys(enumOption).map((propKey) => enumOption[propKey]);
        }
    }

    // check for validation inconsistencies
    if (isWithStringValidate(rawOptions) && !isString(Type)) {
        throw new NotStringTypeError(key);
    }

    if (isWithNumberValidate(rawOptions) && !isNumber(Type)) {
        throw new NotNumberTypeError(key);
    }

    const instance = new Type();
    const subSchema = schema[instance.constructor.name];
    if (!subSchema && !isPrimitive(Type) && !isObject(Type)) {
        throw new InvalidPropError(Type.name, key);
    }

    const options = _.omit(rawOptions, ['ref', 'items']);
    if (isPrimitive(Type)) {
        if (isArray) {
            schema[name][key][0] = {
                ...schema[name][key][0],
                ...options,
                type: Type,
            };
            return;
        }
        schema[name][key] = {
            ...schema[name][key],
            ...options,
            type: Type,
        };
        return;
    }

    // If the 'Type' is not a 'Primitive Type' and no subschema was found treat the type as 'Object'
    // so that mongoose can store it as nested document
    if (isObject(Type) && !subSchema) {
        schema[name][key] = {
            ...schema[name][key],
            ...options,
            type: Object,
        };
        return;
    }

    if (isArray) {
        let obj: any = {};
        if (subSchema)
            obj.type = newSchema[instance.constructor.name];
        schema[name][key][0] = {
            ...schema[name][key][0],
            ...options,
            //...subSchema,
            ...obj,
        };
        return;
    }

    const Schema = mongoose.Schema;

    const supressSubschemaId = rawOptions._id === false;
    schema[name][key] = {
        ...schema[name][key],
        ...options,
        type: newSchema[instance.constructor.name]
        //new Schema({ ...subSchema }, supressSubschemaId ? { _id: false } : {}),
    };
    return;
};

export const prop = (options: (SchemaTypeOpts<any> | Schema | SchemaType) & PropOptionsWithValidate = {}) => (target: any, key: string) => {
    const Type = (Reflect as any).getMetadata('design:type', target, key);

    if (!Type) {
        throw new NoMetadataError(key);
    }

    baseProp(options, Type, target, key);
};

export const arrayProp = (options: ArrayPropOptions) => (target: any, key: string) => {
    const Type = options.items;
    baseProp(options, Type, target, key, true);
};
//#endregion

export let model = function (options: { schemaOptions?: SchemaOptions } = {}): ClassDecorator {
    return function (target) {
        options = {
            ...options
        };
        let { schemaOptions } = options;
        const name = target.name;
        let className = [];
        let parentCtor = Object.getPrototypeOf(target.prototype).constructor;
        while (parentCtor && parentCtor.name !== 'Typegoose' && parentCtor.name !== 'Object') {
            className.unshift(parentCtor.name);
            parentCtor = Object.getPrototypeOf(parentCtor.prototype).constructor;
        }

        let extendList = [
            methods.staticMethods,
            methods.instanceMethods,
            hooks,
            plugins,
            virtuals,
            schema,
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

        let sch: Schema = instanceTypegoose['buildSchema'](name, schemaOptions);
        if (newSchema[name])
            throw new Error(`schema [${name}] have exists`);
        newSchema[name] = sch;
    }
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