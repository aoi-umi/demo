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
        let require = function (key) {
            return window[key];
        };
        let exports = {};
        window['config'] = factory(require, exports);
    }
})(function (require, exports) {
    return {
        cacheKey: {
            userInfo: 'userInfoCacheKey'
        }
    }
});