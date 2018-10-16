import * as mongoose from 'mongoose';
import { Mongoose, ConnectionOptions } from 'mongoose';
import * as _ from 'lodash';

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