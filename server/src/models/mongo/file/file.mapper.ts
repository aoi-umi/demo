import { Types } from 'mongoose';

import * as config from '../../../config';

export class FileMapper {
    static getImgUrl(_id, host?: string) {
        if (!_id)
            return '';
        if (host) {
            host = '//' + host;
        }
        return host + config.env.imgPrefix + '?_id=' + _id;
    }
}