import { Request, Response, Express } from 'express';
import routes from './routes';
import * as mongo from './_system/dbMongo';

export async function init() {
    await mongo.connect();
}

export let register = function (app: Express) {
    app.use('/devMgt', routes);
}

