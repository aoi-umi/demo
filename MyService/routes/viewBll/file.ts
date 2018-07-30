import * as readChunk from 'read-chunk';
import * as fileType from 'file-type';
import * as Q from 'q';
import * as fs from 'fs';
import * as path from 'path';

import config from '../../config';
import * as common from '../_system/common';


export let get = async function (opt, viewOpt) {
    let fileList = [];
    let fileDir = path.resolve(config.fileDir)
    let dir = fileDir;
    !opt.name && (opt.name = '');
    if (opt.name)
        dir += '/' + opt.name;
    dir = path.resolve(dir);
    if (dir.indexOf(fileDir) < 0 || !fs.existsSync(dir))
        throw common.error('path not exist');
    let files = await Q.denodeify<string[]>(fs.readdir)(dir);
    if (opt.name) {
        fileList.push({
            name: '..',
            path: opt.name.indexOf('/') >= 0 ? `${opt.name}/..` : '',
            size: 0,
            isDir: true,
        });
    }
    for (let filename of files) {
        let filepath = `${dir}/${filename}`;
        let stat = await Q.denodeify<fs.Stats>(fs.stat)(filepath);
        let file: any = {
            name: filename,
            path: filename,
            isDir: stat.isDirectory(),
            size: stat.size,
        };

        if (stat.isFile()) {
            let buffer = readChunk.sync(filepath, 0, 4100);
            let type = fileType(buffer);
            file = {
                ...file,
                ...type,
            }
        }
        fileList.push(file);
    }
    viewOpt.files = fileList;
}