/**
 * Created by bang on 2017-9-11.
 */
import * as $ from 'jquery'; 
import {MyModuleGeneric, ModuleOptionGeneric} from './myModule';

interface ModuleMainContentLogOption extends ModuleOptionGeneric<ModuleMainContentLog> {
    mainContentId?: number;
}
export class ModuleMainContentLog extends MyModuleGeneric<ModuleMainContentLog, ModuleMainContentLogOption> {
    constructor(option?: ModuleMainContentLogOption) {
        var opt: ModuleMainContentLogOption = {
            operation: ['query'],
            interfacePrefix: 'mainContentLog',        
            init: function (self) {
                self.opt.queryArgsOpt = [ {
                    name: 'mainContentId',
                    canNotNull: true,               
                    getValue: function () {
                        return self.opt.mainContentId;
                    }
                }];
            },
            
        };

        opt = $.extend(opt, option);
        super(opt);
    }
}