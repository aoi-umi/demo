import { Types } from 'mongoose';

import * as config from '@/config';
import { myEnum } from '@/config';
import { FileModel } from './file';

export class FileMapper {
    static getUrl(_id, fileType: string, opt?: {
        host?: string;
        isRaw?: boolean;
    }) {
        if (!_id)
            return '';
        opt = {
            ...opt
        };
        let host = opt.host;
        if (host) {
            host = '//' + host;
        }
        let url = {
            [myEnum.fileType.图片]: config.env.imgPrefix,
            [myEnum.fileType.视频]: config.env.videoPrefix,
        }[fileType];
        let params: any = {
            _id
        };
        if (opt.isRaw)
            params.isRaw = true;
        return !url ? '' :
            host + url + '?' +
            Object.entries(params)
                .filter(o => o[1])
                .map(o => `${o[0]}=${o[1]}`)
                .join('&');
    }

    static getImgUrl(_id, host?: string) {
        return this.getUrl(_id, myEnum.fileType.图片, { host });
    }

    static getVideoUrl(_id, host?: string) {
        return this.getUrl(_id, myEnum.fileType.视频, { host });
    }

    static async findWithRaw(cond) {
        let fileList = await FileModel.find(cond);
        let rawFileList = fileList.length ? await FileModel.rawFind({ _id: { $in: fileList.map(ele => ele.fileId) } }) : [];
        return fileList.map(file => {
            let rawFile = rawFileList.find(raw => raw._id.equals(file.fileId));
            return {
                file,
                rawFile
            };
        });
    }
}