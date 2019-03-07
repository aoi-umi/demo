import * as Q from 'q';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { ClientSession } from 'mongodb';

import config from '../config/config';

export function connect() {
    return mongoose.connect(config.mongoose.uri, config.mongoose.options);
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