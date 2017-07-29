/**
 * Created by bang on 2017-7-29.
 */
module.exports = {
    getEnum: function (enumName) {
        var enumType = this.enumDict[enumName];
        if (!enumType) throw new Error('enum "' + enumName + '" not exist!');
        return enumType;
    },
    getKey: function (enumName, value) {
        var enumType = this.getEnum(enumName);
        for (var i in enumType) {
            if (enumType[i] == value) return i;
        }
        return '';
    },
    getValue: function (enumName, key) {
        var enumType = this.getEnum(enumName);
        return enumType[key];
    },
    enumDict: {
        statusEnum: {'0': '状态0', '1': '状态1', '2': '状态2',}
    },
    //fsm
    //      目标类型
    //源类型 0 不能改变 非0 可改变
    enumCheck:{
        statusEnum:[
            [1, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ]
    }
};