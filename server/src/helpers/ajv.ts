import * as Ajv from 'ajv';

/**
 * 正则匹配
 */
const date = /(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)/;
const time = /(([0-1][0-9])|([2][0-3])):([0-5][0-9])(:([0-5][0-9]))?/;
export let patterns = {
    price: /^\d+(\.\d{0,2})?$/.source, // 价格， 保留2位小数
    int: /^[\d]+$/.source,
    objId: '^[0-9a-z]{24}$', // ObjectId 字符串
    // YYYY-MM-DD 日期
    date: `^${date.source}$`,
    time: `^${time.source}$`,
    // YYYY-MM-DD HH:mm:ss
    datetime: `^${date.source}(\\s${time.source})?$`,
}

export const ajvInst = new Ajv({ allErrors: true, jsonPointers: true });

require('ajv-errors')(ajvInst /*, {singleError: true} */);

export const ajvNumberType = ['string', 'number'];

const idPrefix = 'http://example.com/schemas/';
const defName = 'defs.json';
const def = {
    objId: {
        type: 'string',
        pattern: patterns.objId
    },
    price: {
        type: ajvNumberType,
        myPattern: patterns.price
    },
    int: {
        type: ajvNumberType,
        myPattern: patterns.int
    },
};
ajvInst.addSchema({
    $id: idPrefix + defName,
    definitions: def
});

export let refType: { [x in keyof (typeof def)]?: string } = {};
for (let key in def) {
    refType[key] = idPrefix + defName + '#/definitions/' + key;
}
ajvInst.addKeyword('myPattern', {
    type: ajvNumberType,
    compile: (sch, parentSchema) => {
        return function (val) {
            return new RegExp(sch).test(val);
        };
    },
});
