/**
 * Created by bang on 2017-7-29.
 */
var config = require('../../config');
var common = require('./common');
var myEnum = exports;
exports.getEnum = function (enumName, notThrowError) {
    var enumType = this.enumDict[enumName];
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

exports.enumDict = {
    main_content_type_enum: {'0': '文章',},
    main_content_status_enum: {'-1': '已删除', '0': '草稿', '1': '待审核', '2': '审核中', '3': '通过', '4': '退回'},
    //添加 _operate 后缀
    main_content_status_enum_operate: {'recovery': '恢复'},
    main_content_log_type_enum: {
        //main_conetnt
        '0': '主内容保存', '1': '主内容提交', '2': '主内容审核', '3': '主内容审核通过', '4': '主内容审核不通过', '5': '主内容删除', '6': '主内容恢复',
    },
};

exports.enumChangeDict = {
    statusEnum: {
        //源状态
        '0': {
            //目标状态
            '0': '',//不可变更
            '1': '状态0变为状态1',
        },
    },
    main_content_status_enum: {
        //初始状态
        '0': {'0': '保存', '1': '提交', '-1': '删除'},
        '1': {'2': '审核', '3': '审核通过', '4': '审核不通过', '-1': '删除'},
        '2': {'2': '审核', '3': '审核通过', '4': '审核不通过', '-1': '删除'},
        '3': {'-1': '删除'},
        '4': {'0': '保存', '1': '提交', '-1': '删除'},
        '-1': {'recovery': '恢复'},
    }
};

//状态变更
exports.enumChangeCheck = function (enumType, srcEnum, destEnum) {
    if (enumType == undefined)
        throw common.error('enumType can not be empty!');

    var enumOperateType = enumType + '_operate';
    var matchEnum = myEnum.getEnum(enumType);
    var operateEnum = myEnum.getEnum(enumOperateType, true);
    var changeDict = myEnum.enumChangeDict[enumType];
    if(srcEnum == undefined || srcEnum == null || destEnum == undefined || destEnum == null)
        throw common.error('','ARGS_ERROR');
    srcEnum = srcEnum.toString();
    destEnum = destEnum.toString();
    var undefinedOrNull = [undefined, null];
    if (common.isInArray(matchEnum[srcEnum], undefinedOrNull)
        && (!operateEnum && common.isInArray(operateEnum[srcEnum], undefinedOrNull))
    )
        throw common.error(common.stringFormat('no match src enum [{0}] in [{1}]!', srcEnum, enumType), 'CODE_ERROR');

    if (common.isInArray(matchEnum[destEnum], undefinedOrNull)
        && (!operateEnum && common.isInArray(operateEnum[destEnum], undefinedOrNull))
    )
        throw common.error(common.stringFormat('no match dest enum [{0}] in [{1}]!', destEnum, enumType), 'CODE_ERROR');

    if (!changeDict[srcEnum] || !changeDict[srcEnum][destEnum]) {
        var srcEnumName = myEnum.getValue(enumType, srcEnum) || myEnum.getValue(enumOperateType, srcEnum);
        var destEnumName = myEnum.getValue(enumType, destEnum) || myEnum.getValue(enumOperateType, destEnum);
        throw common.error(null, 'ENUM_CHANGED_INVALID', {
            //lang:'en',
            format: function (msg) {
                if(config.env == 'dev') {
                    return common.stringFormat(msg,
                        `${enumType}:` + `[${srcEnum}](${srcEnumName})`,
                        `[${destEnum}](${destEnumName})`);
                }else{
                    return common.stringFormat(msg,
                        `[${srcEnumName}]`,
                        `[${destEnumName}]`);
                }
            }
        });
    }
};
