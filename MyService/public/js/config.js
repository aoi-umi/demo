/**
 * Created by bang on 2017-7-28.
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    } else {
        namespace('config', factory(require, {}));
    }
})(function (require, exports) {
    return {
        cacheKey: {
            userInfo: 'userInfoCacheKey'
        }
    }
});