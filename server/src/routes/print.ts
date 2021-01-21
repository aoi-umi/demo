import { paramsValid } from '@/helpers';
import * as ValidSchema from '@/valid-schema/class-valid';
import { MyRequestHandler } from '@/middleware';
import { error } from '@/_system/common';
import * as config from '@/config';

import { PrintMapper, PrintModel } from '@/models/mongo/print';

export const getData: MyRequestHandler = async (opt) => {
    let data = paramsValid(opt.reqData, ValidSchema.PrintGetDataOpt);
    let logic = printLogic[data.type];
    if (!logic)
        throw error(`错误的打印类型${data.type}`);
    let rs = await logic(data.data);

    return rs instanceof Array ? rs : [rs];
};

type ArrayOrSelf<T> = Array<T> | T
type PromiseOrSelf<T> = Promise<T> | T
type PrintDataType = {
    label?: string;
    template: any;
    data: any[];
};
const printLogic: { [key: string]: (data) => PromiseOrSelf<ArrayOrSelf<PrintDataType>> } = {
    test: (data) => {
        let rsData = {
            template: {
                'panels': [
                    {
                        'index': 0,
                        'height': 100,
                        'width': 100,
                        'paperHeader': 0,
                        'paperFooter': 283,
                        'printElements': [
                            {
                                'options': {
                                    'left': 72,
                                    'top': 43.5,
                                    'height': 123,
                                    'width': 120,
                                    'field': 'img',
                                    'src': 'https://cn.vuejs.org/images/logo.png'
                                },
                                'printElementType': {
                                    'type': 'image'
                                }
                            },
                            {
                                'options': {
                                    'left': 73.5,
                                    'top': 24,
                                    'height': 9.75,
                                    'width': 120,
                                    'field': 'name'
                                },
                                'printElementType': {
                                    'type': 'text'
                                }
                            }
                        ],
                        'paperNumberLeft': 253,
                        'paperNumberTop': 261,
                        'paperNumberDisabled': true
                    }
                ]
            },
        };
        return [{
            ...rsData,
            label: '标签1',
            data: [{
                name: '打印测试',
                img: 'https://cn.vuejs.org/images/logo.png'
            }],
        }, {
            ...rsData,
            label: '标签2',

            data: [{
                name: '打印测试2',
                img: 'https://nodejs.org/static/images/logo.svg'
            }]
        }];
    }
};