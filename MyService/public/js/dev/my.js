/**
 * Created by bang on 2017-9-11.
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", 'jquery', 'common'], factory);
    } else {
        let exports = {};
        namespace('my');
        my = factory(require, exports);
    }
})(function (require, exports) {
    return exports;
});