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
    enumCheck:{
        statusEnum:{
            //源状态
            '0':{
                //目标状态
                '0':'',//不可变更
                '1':'状态0变为状态1',
            },
            '1':{
                '2':'操作2'
            },
            '2':{},
        }
    }
};