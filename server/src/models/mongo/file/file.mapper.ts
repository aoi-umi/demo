import { Types } from 'mongoose';

import * as config from '@/config';
import { myEnum } from '@/config';

export class FileMapper {
    static getUrl(_id, fileType: string, host?: string) {
        if (!_id)
            return '';
        if (host) {
            host = '//' + host;
        }
        let url = {
            [myEnum.fileType.图片]: config.env.imgPrefix,
            [myEnum.fileType.视频]: config.env.videoPrefix,
        }[fileType];
        return url ? host + url + '?_id=' + _id : '';
    }
    
    static getImgUrl(_id, host?: string) {
        return this.getUrl(_id, myEnum.fileType.图片, host);
    }
}