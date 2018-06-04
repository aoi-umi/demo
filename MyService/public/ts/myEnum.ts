/**
 * Created by bang on 2017-9-11.
 */

import * as common from './common';

export let init = function (opt) {
    if (opt.enumDict)
        enumDict = opt.enumDict;
}

export let getEnum = function (enumName, notThrowError?) {
    var enumType = enumDict[enumName];
    if (!enumType && !notThrowError) throw common.error('enum "' + enumName + '" not exist!', 'CODE_ERROR');
    return enumType;
};

export let getKey = function (enumName, value) {
    var enumType = this.getEnum(enumName);
    for (var i in enumType) {
        if (enumType[i] == value) return i;
    }
    return '';
};

export let getValue = function (enumName, key) {
    var enumType = this.getEnum(enumName);
    return enumType[key];
};

export let enumDict = {};