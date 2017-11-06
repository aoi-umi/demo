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
        statusEnum: {'0': '状态0', '1': '状态1', '2': '状态2',},
        statusEnum2: {'0': '状态0', '1': '状态1', '2': '状态2',},
        main_content_status_enum:{'-1':'已删除', '0':'草稿','1':'待审核','2':'审核中','3':'通过','4':'退回',},
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
        },
        statusEnum2:{
            '0':{'1':'surprise operation'}
        }
    }
};