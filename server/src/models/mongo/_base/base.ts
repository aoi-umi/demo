import {
    Model, ModelType, DocType, InstanceType,
    setSchema, setStatic,
} from 'mongoose-ts-ua';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

import { parseBool } from '@/_system/common';
import * as config from '@/config';
import { error } from '@/_system/common';
import { Schema } from 'mongoose';

export type BaseInstanceType = InstanceType<Base>;
export type BaseModelType = ModelType<Base, typeof Base>;
export type BaseDocType = DocType<BaseInstanceType>;
@setSchema()
export class Base extends Model<Base> {
    
}
