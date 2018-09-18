
import * as logService from './service/logService';
import * as common from './_system/common';

export let logSave = function (log) {
    for (var key in log) {
        var value = log[key];
        if (value && typeof (value) === 'object')
            log[key] = JSON.stringify(value);
    }
    return logService.save(log).fail(function () {

    });
};
export type RequestServiceByConfigOption = common.RequestServiceByConfigOption & {
    noLog?: boolean;
};
export let requestServiceByConfig = function (option: RequestServiceByConfigOption) {
    return common.requestServiceByConfig(option).finally(function () {
        if (!option.noLog) {
            logSave(option.outLog);
        }
    });
}