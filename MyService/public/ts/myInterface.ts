/**
 * Created by bang on 2017-9-11.
 */
import * as common from './common';

let opt = {
    interfaceConfig: {},
    moduleList: [],
    defaultMethod: ['query', 'detailQuery', 'save', 'del'],
    setModuleConfig: function (module, method) {
        var key = module + common.stringToPascal(method);
        if (!this.interfaceConfig[key]) {
            this.interfaceConfig[key] = {
                url: `/interface/${module}/${method}`
            }
        }
    }
};
export let init = function (option) {
    opt = $.extend(opt, option);
    var interfaceConfig = opt.interfaceConfig;
    var moduleList = opt.moduleList;
    var defaultMethod = opt.defaultMethod;
    $(moduleList).each(function () {
        var module = this;
        $(defaultMethod).each(function () {
            var method = this;
            opt.setModuleConfig(module, method);
        });
    });
    for (var key in interfaceConfig) {
        if (api[key])
            throw new Error('interface [' + key + '] is exist!');
        api[key] = createFunction(interfaceConfig[key]);
    }
};

export let api: { [key: string]: (data, option?) => Q.Promise<any> } = {};
let createFunction = function (interfaceConfig) {
    var fun = function (data, option?) {
        var url = interfaceConfig.url;
        var opt = {
            url: url,
            data: data,
        };
        if (option) opt = $.extend(opt, option);
        return common.ajax(opt);
    }
    return fun;
};