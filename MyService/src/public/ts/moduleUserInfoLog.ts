/**
 * Created by bang on 2017-9-11.
 */
import * as $ from 'jquery'; 
import {MyModuleGeneric, ModuleOptionGeneric} from './myModule';

interface ModuleUserInfoLogOption extends ModuleOptionGeneric<ModuleUserInfoLog> {
    userInfoId?: number;
}
export class ModuleUserInfoLog extends MyModuleGeneric<ModuleUserInfoLog, ModuleUserInfoLogOption> {
    constructor(option?: ModuleUserInfoLogOption) {
        var opt: typeof option = {
            operation: ['query'],
            interfacePrefix: 'userInfoLog',
            init: function (self) {
                self.opt.queryArgsOpt = [ {
                    name: 'userInfoId',
                    canNotNull: true,               
                    getValue: function () {
                        return self.opt.userInfoId;
                    }
                }];
            },
            
        };

        opt = $.extend(opt, option);
        super(opt);
    }
}