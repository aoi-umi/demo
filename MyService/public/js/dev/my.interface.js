/**
 * Created by bang on 2017-9-11.
 */
namespace('my.interface');
my.interface = {
    opt: {
        interfaceConfig: {},
        moduleList: [],
        defaultMethod: ['query', 'detailQuery', 'save', 'del'],
        setModuleConfig: function(module, method) {
            var key = module + common.stringToPascal(method);
            if (!this.interfaceConfig[key]) {
                this.interfaceConfig[key] = {
                    url: `/interface/${module}/${method}`
                }
            }
        }
    },
    init: function (option) {
        var self = this;
        self.opt = $.extend(self.opt, option);
        var interfaceConfig = self.opt.interfaceConfig;
        var moduleList = self.opt.moduleList;
        var defaultMethod = self.opt.defaultMethod;
        $(moduleList).each(function() {
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
    },
    createFunction:function (interfaceConfig) {
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
    }
};