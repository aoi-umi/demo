namespace('my.enum');
(function () {
    var exports = my.enum = {};
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
})();