import * as Q from 'q';
import * as mongoose from 'mongoose';
import { Model, Types } from 'mongoose';
import { config as mongooseTsConfig, InstanceType } from 'mongoose-ts-ua';
import * as mongodb from 'mongodb';
import { ClientSession, MongoClient, CommonOptions, GridFSBucket } from 'mongodb';
import * as stream from 'stream';

import config from '../config/config';
mongooseTsConfig.schemaOptions = { timestamps: true };
require('mongoose').Promise = Q.Promise;
declare module 'mongoose' {
    type Promise<T> = Q.Promise<T>;

    //补充
    interface Document {
        remove(opt?: CommonOptions, fn?: (err: any, product: this) => void): Promise<this>;
    }
    interface Model<T extends Document, QueryHelpers = {}> {
        deleteMany(conditions: any, opt?: CommonOptions, callback?: (err: any) => void): Query<mongodb.WriteOpResult['result']> & QueryHelpers;

        findByIdAndDelete(id: any, options?: CommonOptions & {
            /** if multiple docs are found by the conditions, sets the sort order to choose which doc to update */
            sort?: any;
            /** sets the document fields to return */
            select?: any;
        }): DocumentQuery<T | null, T> & QueryHelpers;

        findOneAndRemove(conditions: any, options: CommonOptions & {
			/**
			 * if multiple docs are found by the conditions, sets the sort order to choose
			 * which doc to update
			 */
            sort?: any;
            /** puts a time limit on the query - requires mongodb >= 2.6.0 */
            maxTimeMS?: number;
            /** sets the document fields to return */
            select?: any;
        }): DocumentQuery<T | null, T> & QueryHelpers;

        bulkWrite(writes: any[], options?: CommonOptions): Promise<mongodb.BulkWriteOpResultObject>;
    }
}
export async function connect() {
    let conn = await mongoose.connect(config.mongoose.uri, config.mongoose.options);
    gfs = new GridFS(conn.connection.db);
}

export async function transaction(fn: (session: ClientSession) => any) {
    const session = await mongoose.connection.startSession();
    session.startTransaction({
        readConcern: {
            level: 'snapshot'
        },
        writeConcern: {
            w: 'majority'
        }
    });
    let result;
    try {
        result = await fn(session);
        await session.commitTransaction();
    } catch (e) {
        await session.abortTransaction();
        throw e;
    }
    return result;
}

mongoose.connection.once('open', () => {
    let orgModel = mongoose.model;

    //事务中无法创建表，定义的时候创建
    function createCollection(model) {
        (async () => {
            let listCol = model.collection.conn.db.listCollections({
                name: model.collection.collectionName
            });
            let t = await Q.denodeify<any[]>(listCol.toArray.bind(listCol))();
            if (!t.length) {
                let x = await model.collection.conn.createCollection(model.collection.collectionName);
            }
        })().catch(e => {
            console.log(e);
        });
    }

    for (let key in mongoose.models) {
        let model = mongoose.models[key];
        createCollection(model);
    }

    (mongoose.model as any) = function () {
        let model: Model<any> = orgModel.apply(mongoose, arguments);
        createCollection(model);
        return model;
    };
});

export class GridFS {
    gridFS: GridFSBucket;
    constructor(db: mongodb.Db, options?: mongodb.GridFSBucketOptions) {
        this.gridFS = new GridFSBucket(db, options);
    }

    async find<T = any>(filter?: object, options?: mongodb.GridFSBucketFindOptions) {
        let rs = await this.gridFS.find(filter, options).toArray();
        return rs as GridFSInstance<T>[];
    }

    async findOne<T = any>(filter?: object) {
        let rs = await this.find<T>(filter, { limit: 1 });
        return rs[0];
    }

    async readFile(opt: { _id: Types.ObjectId }) {
        let defer = Q.defer<Buffer>();
        let stream = this.gridFS.openDownloadStream(opt._id);
        let buffer = [];
        stream.on('data', (buf) => {
            buffer.push(buf);
        }).on('end', () => {
            defer.resolve(Buffer.concat(buffer))
        }).on('error', (err) => {
            defer.reject(err);
        });
        return defer.promise;
    }

    async upload(opt: { _id: Types.ObjectId; buffer: Buffer, filename?: string; metadata?: any; contentType?: string }) {
        let defer = Q.defer<Boolean>();
        let readstream = new stream.PassThrough();
        readstream.end(opt.buffer);
        let writeStream = this.gridFS.openUploadStreamWithId(opt._id, opt.filename, {
            metadata: opt.metadata,
            contentType: opt.contentType
        });
        writeStream.on('finish', function () {
            defer.resolve(true);
        }).on('error', function (err) {
            defer.reject(err);
        });
        readstream.pipe(writeStream);
        return defer.promise;
    }
}

export type GridFSInstance<T = any> = InstanceType<{
    filename: string;
    metadata: T;
    contentType: string;
    uploadDate: Date
}>;

export let gfs: GridFS;
