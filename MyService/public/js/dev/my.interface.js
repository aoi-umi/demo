/**
 * Created by bang on 2017-9-11.
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", 'jquery', 'common', 'my'], factory);
    } else {
        let exports = {};
        namespace('my.interface');
        my.interface = factory(require, exports);
    }
})(function (require, exports) {
    let $ = require('jquery');
    let common = require('common');
    let my = require('my');
    exports.opt = {
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
    exports.init = function (option) {
        var self = this;
        self.opt = $.extend(self.opt, option);
        var interfaceConfig = self.opt.interfaceConfig;
        var moduleList = self.opt.moduleList;
        var defaultMethod = self.opt.defaultMethod;
        $(moduleList).each(function () {
            var module = this;
            $(defaultMethod).each(function () {
                var method = this;
                self.opt.setModuleConfig(module, method);
            });
        });
        for (var key in interfaceConfig) {
            if (self[key])
                throw new Error('interface [' + key + '] is exist!');
            self[key] = self.createFunction(interfaceConfig[key]);
        }
    };
    exports.createFunction = function (interfaceConfig) {
        var fun = function (data, option) {
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
    return my.interface = exports;
});