/**
 * Created by bang on 2017-9-21.
 */
(function (factory) {
    namespace('myVaild', factory(require, {}));
})(function (require, exports) {
    exports.isInt = function (val, type) {
        //- 0 +
        //1 1 1 -> 0-7
        var reg = /^-?[\d]+$/;
        var t = '';
        if (typeof type == 'number') {
            while (type > 0) {
                t = type % 2 + t;
                type = parseInt(type / 2);
            }
        } else {
            t = type;
        }
        switch (t) {
            case '001':
                reg = /^[1-9][\d]*$/;
                break;
            case '010':
                reg = /^0+$/;
                break;
            case '011':
                reg = /^[\d]+$/;
                break;
            case '100':
                reg = /^-[\d]+$/;
                break;
            case '101':
                reg = /^-?[1-9][\d]*$/;
                break;
            case '110':
                reg = /^-[\d]+$/;
                break;
        }
        return reg.test(val);
    };
    exports.isAccount = function (val) {
        return /^[a-zA-Z][a-zA-Z\d_]{5,}$/.test(val);
    };
    exports.isAuthority = function (val) {
        return /^[a-zA-Z\d_]+$/.test(val);
    };
    exports.isRole = function (val) {
        return /^[a-zA-Z\d_]+$/.test(val);
    };
    return exports;
});
