/**
 * Created by bang on 2017-9-11.
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", 'jquery', 'common', 'my'], factory);
    } else {
        let exports = {};
        namespace('my.enum');
        my.enum = factory(require, exports);
    }
})(function (require, exports) {
    let my = require('my');
    exports.getEnum = function (enumName, notThrowError) {
        var enumType = exports.enumDict[enumName];
        if (!enumType && !notThrowError) throw common.error('enum "' + enumName + '" not exist!', 'CODE_ERROR');
        return enumType;
    };

    exports.getKey = function (enumName, value) {
        var enumType = this.getEnum(enumName);
        for (var i in enumType) {
            if (enumType[i] == value) return i;
        }
        return '';
    };

    exports.getValue = function (enumName, key) {
        var enumType = this.getEnum(enumName);
        return enumType[key];
    };

    exports.enumDict = {};
    return my.enum = exports;
});