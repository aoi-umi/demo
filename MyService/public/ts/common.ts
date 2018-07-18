import 'jquery-ui';
import * as $ from 'jquery';
import * as Q from 'q';
//@ts-ignore
import * as SparkMD5 from 'spark-md5';

window['common'] = exports;

//region 前后通用
/**
 *
 * @param fn 带nodeCallback参数的方法
 * @param caller 调用对象
 * @param nodeCallback false通过defer控制,true cb参数控制
 * @param args
 */
export let promise = function (fn: Function, caller?: any, nodeCallback?: boolean, args?: any[]): Q.Promise<any> {
    var defer = Q.defer();
    try {
        if (!fn) {
            throw error('fn can not be null');
        }
        if (!args)
            args = [];
        if (!nodeCallback) {
            var def = Q.defer();
            args.push(def);
            defer.resolve(fn.apply(caller, args));
        } else {
            args.push(defer.makeNodeResolver());
            // args.push(function (err, ...cbArgs) {
            //     if (err)
            //         defer.reject(err);
            //     else {
            //         defer.resolve.apply(void 0, cbArgs);
            //     }
            // });
            fn.apply(caller, args);
        }
    } catch (e) {
        defer.reject(e);
    }
    return defer.promise;
};

//示例
// let fun = function (type, def) {
//     if (type == 1) {
//         setTimeout(() => {
//             def.resolve('promise_' + type);
//         }, 1000);
//         return def.promise;
//     } else if (type == 2) {
//         setTimeout(() => {
//             let cb = def;
//             cb(null, 'promise_' + type)
//         }, 1000);
//     }
// }
// promise(fun, void 0, false, 1).then((t) => {
//     console.log(t);
// });

// promise(fun, void 0, true, 2).then((t) => {
//     console.log(t);
// });

export let promiseAll = function (list: Array<Q.Promise<any>>) {
    let returnData = {
        count: list.length,
        successCount: 0,
        failCount: 0,
        resultList: []
    };
    let d: Q.Deferred<any>;
    promise((defer) => {
        d = defer;
        list.forEach((ele, idx) => {
            ele.then(t => {
                returnData.successCount++;
                returnData.resultList[idx] = {success: true, detail: t};
            }).fail(e => {
                returnData.failCount++;
                returnData.resultList[idx] = {success: false, detail: e};
            }).finally(() => {
                if (returnData.successCount + returnData.failCount == returnData.count)
                    defer.resolve(returnData);
            });
        });
    }).catch(d.reject);
    return d.promise;
}

export let promisify = function (fun, caller?) {
    return function (...args): Q.Promise<any> {
        return promise.apply(void 0, [fun, caller, true, args]);
    };
};

export let promisifyAll = function (obj) {
    for (var key in obj) {
        if (typeof obj[key] == 'function')
            obj[key + 'Promise'] = promisify(obj[key], obj);
    }
};
export let s4 = function (count?: number) {
    let str = '';
    if (count == undefined)
        count = 1;
    if (count > 0) {
        for (var i = 0; i < count; i++) {
            str += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
    }
    return str;
};
export let guid = function () {
    return `${s4(2)}-${s4()}-${s4()}-${s4()}-${s4(3)}`;
};
export let createToken = function (str) {
    var code = md5(str);
    return code;
};
export let dateFormat = function (date, format = 'yyyy-MM-dd') {
    try {
        if (!date)
            date = new Date();
        else if (typeof date == 'number' || typeof date == 'string')
            date = new Date(date);

        var o = {
            y: date.getFullYear(),
            M: date.getMonth() + 1,
            d: date.getDate(),
            h: date.getHours() % 12,
            H: date.getHours(),
            m: date.getMinutes(),
            s: date.getSeconds(),
            S: date.getMilliseconds()
        };

        var formatStr = format.replace(/(y+|M+|d+|h+|H+|m+|s+|S+)/g, function (e) {
            let key = e.slice(-1);
            if (key == 'S')
                return ('' + o[key]).slice(0, e.length);
            else
                return ((e.length > 1 ? '0' : '') + o[key]).slice(-(e.length > 2 ? e.length : 2));
        });
        return formatStr;
    } catch (e) {
        return e.message;
    }
};
//字符串
export let stringFormat = function (formatString: string, ...args) {
    if (!formatString)
        formatString = '';
    let reg = /(\{(\d)\})/g;
    if (typeof args[0] === 'object') {
        args = args[0];
        reg = /(\{([^{}]+)\})/g;
    }
    let result = formatString.replace(reg, function () {
        let match = arguments[2];
        return args[match] || '';
    });
    return result;
};
//小写下划线
export let stringToLowerCaseWithUnderscore = function (str) {
    str = str.replace(/^[A-Z]+/, function () {
        return arguments[0].toLowerCase();
    });
    str = str.replace(/_/g, '');
    str = str.replace(/[A-Z]/g, function () {
        return '_' + arguments[0].toLowerCase();
    });
    str = str.toLowerCase();
    return str;
};
//驼峰（小驼峰）
export let stringToCamelCase = function (str) {
    str = str.replace(/_([a-zA-Z])/g, function () {
        return arguments[1].toUpperCase();
    });
    return str[0].toLowerCase() + str.substr(1);
};
//帕斯卡（大驼峰）
export let stringToPascal = function (str) {
    str = str.replace(/_([a-zA-Z])/g, function () {
        return arguments[1].toUpperCase();
    });
    return str[0].toUpperCase() + str.substr(1);
};

export let clone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
};
//endregion

//region 同名但实现不同
export let md5 = function (str) {
    return SparkMD5.hash(str);
};
export let isInArray = function (obj, list, startIndex?) {
    return $.inArray(obj, list, startIndex) >= 0;
};
export let error = function (msg, code?) {
    let err: any = new Error(msg);
    if (typeof code !== 'string') {
        code = code.code;
    }
    err.code = code;
    return err;
};
//endregion

//region only
export let stringToBase64 = function (str) {
    return btoa(encodeURIComponent(str));
};
export let base64ToString = function (base64Str) {
    return decodeURIComponent(atob(base64Str));
};
export let md5File = function (file) {
    return promise(function (defer) {
        var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
            chunkSize = 2097152,                             // Read in chunks of 2MB
            chunks = Math.ceil(file.size / chunkSize),
            currentChunk = 0,
            spark = new SparkMD5.ArrayBuffer(),
            fileReader = new FileReader();

        fileReader.onload = function (e) {
            //console.log('read chunk nr', currentChunk + 1, 'of', chunks);
            spark.append(e.target.result);                   // Append array buffer
            currentChunk++;

            if (currentChunk < chunks) {
                loadNext();
            } else {
                // console.log('finished loading');
                // console.info('computed hash', spark.end());  // Compute hash
                return defer.resolve(spark.end());
            }
        };

        fileReader.onerror = function (e) {
            return defer.reject(e);
        };

        function loadNext() {
            var start = currentChunk * chunkSize,
                end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
            fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
        }

        loadNext();
        return defer.promise;
    });
};

interface ajaxOption extends JQuery.AjaxSettings {
    myDataCheck?: Function,
}

export let ajax = function (option: ajaxOption) {
    var opt: ajaxOption = {
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
    };
    opt = $.extend(opt, option);
    var originReq = opt.data;
    if (!opt.data)
        opt.data = {};
    if (typeof opt.data != 'string')
        opt.data = JSON.stringify(opt.data);

    return promise(function (defer) {
        if (opt.myDataCheck) {
            opt.myDataCheck();
        }
        $.ajax(opt).then(defer.resolve).fail(defer.reject);
        return defer.promise;
    }).then(function (t) {
        if (!t.result) {
            if (typeof t.desc == 'object')
                t.desc = JSON.stringify(t.desc);
            var err: any = new Error();
            err.responseJSON = t;
            throw err;
        }
        else
            return t.detail;
    }).fail(function (e: any) {
        if (!e)
            e = new Error();
        if (e.responseJSON) {
            var resData = e.responseJSON
            e = new Error(resData.desc);
            e.code = resData.code;
        }
        else if (e.statusText) {
            e = new Error(e.statusText);
            e.code = e.status;
        }
        throw e;
    });
};
export let parseJSON = function (str) {
    try {
        return JSON.parse(str)
    } catch (e) {
        var browserType = getBrowserType();
        var reg = null;
        switch (browserType) {
            case 'Firefox':
                reg = /JSON.parse:[\s\S]* at line ([\d]) column ([\d]) of the JSON data/;
                var match = e.message.match(reg)
                if (match) {
                    var row = parseInt(match[1]);
                    var col = parseInt(match[2]);
                    var list = str.split(/\r\n|\r|\n/);
                    if (list[row - 1]) {
                        e.message += ' "' + list[row - 1].substr(col - 1) + '"';
                        throw new Error(e.message);
                    }
                }
                break;
            case 'Chrome':
            //reg = /Uncaught SyntaxError: Unexpected token } in JSON at position ([\d])/
            case 'IE':
                break;
        }
        throw e;
    }
};

interface dataCheckOption {
    list: Array<dataCheckOptionListOption>;
}

interface dataCheckOptionListOption {
    name: string;
    desc?: string,
    dom: JQuery<HTMLElement>;
    focusDom?: JQuery<HTMLElement>
    canNotNull?: boolean;
    canNotNullDesc?: string;
    isTrim?: boolean;
    getValue?: any;
    // getValue: function () {
    //     return this.dom.find("option:selected").text();
    // },
    checkValue?: Function;
    // checkValue: function (value, model) {
    //     if (!value) {
    //         return ('密码只能由8~20位字母和数字组成');
    //     }
    // }
}

export let dataCheck = function (option: dataCheckOption) {
    var data = {
        success: false,
        model: {} as any,
        desc: '',
        err: null,
        dom: null
    };
    if (!option) return data;
    for (var i = 0; i < option.list.length; i++) {
        var noName = false;
        var t = option.list[i];
        var name = (t.desc || t.name);
        data.dom = t.focusDom || t.dom;
        if (typeof t.isTrim == 'undefined') t.isTrim = true;
        if (!t.canNotNullDesc) t.canNotNullDesc = '{0}不能为空';
        var checkOpt: any = {};
        try {
            var value: any = '';
            var typeOfGetValue = typeof t.getValue;
            switch (typeOfGetValue) {
                case 'function':
                    value = t.getValue(data.model);
                    break;
                case 'string':
                    let getValue = t.dom[t.getValue] as any;
                    if (typeof getValue == 'function') value = getValue();
                    else value = getValue;
                    break;
                default:
                    value = t.getValue == void 0 ? t.dom.val() : t.getValue;
                    break;
            }
            if (typeof value == 'string') {
                //if (t.dom && value == t.dom.attr('placeholder'))
                //    value = '';
                if (t.isTrim)
                    value = $.trim(value);
            }
            data.model[t.name] = value;
            if (t.canNotNull && (value === '' || value == null)) {
                noName = true;
                throw stringFormat(t.canNotNullDesc, name);
            }
            if (t.checkValue) {
                var err = t.checkValue(value, data.model, checkOpt);
                if (err) {
                    noName = true;
                    throw stringFormat(err, name);
                }
            }
        } catch (e) {
            if (checkOpt.dom) data.dom = checkOpt.dom;
            if (e && e.message) e = e.message;
            var errStr = (typeof e == 'object') ? JSON.stringify(e) : e;
            data.desc = (noName ? '' : name) + errStr;
            data.err = e;
            return data;
        }
    }
    data.dom = null;
    data.success = true;
    return data;
};
//时间
export let dateParse = function (date) {
    if (typeof date == 'string')
        date = date.replace(/-/g, '/');
    if (!isNaN(date) && !isNaN(parseInt(date)))
        date = parseInt(date);
    if (!(date instanceof Date))
        date = new Date(date);
    return date;
};
export let getDateDiff = function (date1, date2) {
    date1 = dateParse(date1);
    date2 = dateParse(date2);

    var isMinus = false;
    //date1 开始日期 ，date2 结束日期
    var timestamp = date2.getTime() - date1.getTime(); //时间差的毫秒数
    if (timestamp < 0) {
        timestamp = -timestamp;
        isMinus = true;
    }
    timestamp /= 1000;
    var seconds = Math.floor(timestamp % 60);
    timestamp /= 60;
    var minutes = Math.floor(timestamp % 60);
    timestamp /= 60;
    var hours = Math.floor(timestamp % 24);
    timestamp /= 24;
    var days = Math.floor(timestamp);
    var diff = (days ? days + ' ' : '') + ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2);
    if (isMinus)
        diff = '-' + diff;
    return diff;
};

interface msgNoticeOption {
    type?: 0 | 1;
    msg?: string;
    template?: string;
    dom?: JQuery<HTMLElement>;

    //type 0 参数
    target?: string;
    position?: string;
    autoHide?: boolean;
    focus?: boolean;

    //type 1 参数
    noClose?: boolean;
    btnTemplate?: string;
    btnOptList?: msgNoticeBtnOption | msgNoticeBtnOption[];
    createNew?: boolean;
}

interface msgNoticeBtnOption {
    class?: string;
    content?: any;
    cbOpt?: any;
    cb?: Function;
}

export let msgNotice = function (option: msgNoticeOption) {
    var opt: msgNoticeOption = {
        type: 0,
        msg: '',
        template: '',
        dom: null,

        //type 0 参数
        target: '',
        position: 'bottom',
        autoHide: true,
        focus: true,

        //type 1 参数
        noClose: false,
        btnTemplate: `<button class="btn btn-content" type="button" ></button>`,
        btnOptList: null,
        createNew: true
    };

    //type 0
    //在target四周显示

    //type 1
    //弹出提示
    var dom = null;
    opt = $.extend(opt, option);
    switch (opt.type) {
        case 0:
            if (!opt.target && opt.dom)
                opt.target = opt.dom['selector'];
            if (!opt.target)
                throw new Error('target can not be null');
            if (!opt.msg)
                throw new Error('msg can not be null');
            if (!opt.template) {
                opt.template = '<div class="popover right" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>';
            }
            dom = $('[data-target="' + opt.target + '"]');
            if (!dom.length) {
                dom = $(opt.template);
                $('body').append(dom);
            }
            dom.attr('data-target', opt.target).find('.popover-content').html(opt.msg);
            dom.removeClass('top bottom left right').addClass(opt.position);
            var x = 0, y = 0;
            var targetDom = opt.dom || $(opt.target);
            switch (opt.position) {
                case 'top':
                    x = targetDom.offset().left;
                    y = targetDom.offset().top - dom.outerHeight() - 3;
                    break;
                case 'bottom':
                    x = targetDom.offset().left;
                    y = targetDom.offset().top + targetDom.outerHeight() + 3;
                    break;
                case 'left':
                    x = targetDom.offset().left - dom.outerWidth() - 3;
                    y = targetDom.offset().top + (targetDom.outerHeight() - dom.outerHeight()) / 2;
                    break;
                default:
                case 'right':
                    opt.position = 'right';
                    x = targetDom.offset().left + targetDom.outerWidth() + 3;
                    y = targetDom.offset().top + (targetDom.outerHeight() - dom.outerHeight()) / 2;
                    break;
            }
            dom.css({'left': x, 'top': y}).show();
            dom.close = function () {
                dom.remove();
            };
            if (opt.focus)
                targetDom.focus();
            if (opt.autoHide) {
                targetDom.on('blur', function () {
                    dom.remove();
                });
            }
            break;
        case 1:
            if (!opt.template) {
                opt.template = `<div data-backdrop="false" role="dialog" tabindex="-1" class="modal fade msg-notice-1">
                            <div class="modal-dialog">
                                <div class="modal-content">
                                    <div class="modal-body">
                                        <button name="closeBtn" class="close" type="button">
                                            ×
                                        </button>
                                        <h4 name="title" class="modal-title">
                                            提示
                                        </h4>
                                    </div>
                                    <div name="content" class="modal-body">
                                    </div>
                                    <div name="footer" class="modal-body">
                                    </div>
                                </div>
                            </div>
                        </div>`;
            }
            dom = opt.dom;
            if (!opt.createNew && !dom) {
                dom = $('.msg-notice-1:eq(0)');
            }
            if (!dom || !dom.length) {
                dom = $(opt.template).attr('id', 'msgNoticeBox_' + new Date().getTime());
                dom.find('[name=closeBtn]').on('click', function () {
                    dom.close();
                });
                dom.close = function () {
                    dom.modal('hide');
                }
            }
            if (opt.noClose)
                dom.find('[name=closeBtn]').addClass('hidden');
            else
                dom.find('[name=closeBtn]').removeClass('hidden');
            dom.find('[name=content]').html(opt.msg);
            dom.find('[name=footer]').empty();
            if (!opt.btnOptList && !opt.noClose) {
                opt.btnOptList = [{
                    content: '确认'
                }];
            }
            if (opt.btnOptList) {
                var btnList = [];
                $(opt.btnOptList).each(function () {
                    var item = this as msgNoticeBtnOption;
                    var btn = $(opt.btnTemplate);
                    var btnClass = item.class || 'btn-default';
                    let content = item.content || '确认';
                    btn.addClass(btnClass);
                    if (btn.hasClass('btn-content'))
                        btn.html(content);
                    else
                        btn.find('.btn-content').html(content);
                    btn.on('click', function () {
                        dom.close();
                        if (item.cb)
                            item.cb(item.cbOpt);
                    });
                    btnList.push(btn);
                });
                dom.find('[name=footer]').append(btnList);
            }
            $('.popover').hide();
            if (dom.is(':hidden')) {
                dom.modal('show');
                var args = getArgsFromUrlParams();
                if (args.iframeId && parent) {
                    parent.scrollTo(null, 0);
                }
            }
            break;
    }
    return dom;
};

export let getArgsFromUrlParams = function () {
    var args: any = {};
    var query = location.search.substring(1);//获取查询串
    var params = query.split('&');
    for (var i = 0; i < params.length; i++) {
        var pos = params[i].indexOf('=');
        if (pos == -1) continue;
        var argname = params[i].substring(0, pos);
        var value = params[i].substring(pos + 1);
        args[argname] = decodeURIComponent(value);
    }
    return args;
};
export let getUrlParamsFromArgs = function (args) {
    var list = [];
    for (var i in args) {
        list.push(i + '=' + encodeURIComponent(args[i]));
    }
    return list.join('&');
};

interface autoCompleteOption {
    dom?: JQuery<HTMLElement>;
    maxLength?: number;
    source?: any;
    select?: (dom: JQuery<HTMLElement>, item) => void;
    renderItem?: (ul, item) => any;
    match?: (input, item) => boolean;
}

export let autoComplete = function (opt: autoCompleteOption) {
    var option = {
        maxLength: 10,
        source: [],
        select: function (dom, item) {
            dom.data('item', item).val(item.value);
        },
        renderItem: function (ul, item) {
            return $('<li>')
                .append('<div>' + item.label + '</div>')
                .appendTo(ul);
        },
        match: function (input, item) {
            if (typeof item != 'object') {
                item = {
                    label: item
                };
            }
            var matcher = new RegExp($.ui.autocomplete.escapeRegex(input), 'i');
            return matcher.test(item.label);
        }
    };
    opt = $.extend(option, opt);
    var dom = opt.dom;

    function clearData() {
        if (!dom.val()) {
            dom.data('item', null);
        }
    }

    function match(request, response) {
        var match = request.sourceList.filter(function (t) {
            return opt.match === undefined ? true : opt.match(request.term, t);
        });
        if (opt.maxLength)
            match = match.slice(0, opt.maxLength);
        response(match);
    }

    dom.on('keyup', function (event) {
        if ((event.keyCode === $.ui.keyCode.TAB)
            && $(this).data('ui-autocomplete').menu.active) {
            event.preventDefault();
        }
        clearData();
    }).on('blur', function () {
        clearData();
    }).on('focus', function () {
        $(this).autocomplete('search');
    }).autocomplete({
        minLength: 0,
        source: function (request, response) {
            var source = opt.source;
            if (typeof source == 'function') {
                source = source();
            }
            if (source.then) {
                source.then(function (t) {
                    request.sourceList = t;
                    match(request, response);
                });
            } else {
                request.sourceList = source;
                match(request, response);
            }
        },
        focus: function () {
            return false;
        },
        select: function (event, ui) {
            opt.select(dom, ui.item);
            return false;
        }
    }).data('ui-autocomplete')._renderItem = opt.renderItem;
};

interface setCountdownOption {
    countdown?: number;
    interval?: number;//秒
    onCountdown?: (dom, endDate) => void;
    onCountdownEnd?: (dom, content) => void;
    dom: JQuery<HTMLElement>
}

export let setCountdown = function (option: setCountdownOption) {
    //seconds
    var opt: setCountdownOption = {
        countdown: 10,
        interval: 1,
        onCountdown: function (dom, endDate) {
            dom.html(getDateDiff(new Date(), endDate));
        },
        onCountdownEnd: function (dom, content) {
            dom.html(content);
        },
        dom: null
    };
    opt = $.extend(opt, option);
    var dom = opt.dom;
    if (dom.hasClass('disabled'))
        return;
    dom.addClass('disabled');

    var content = dom.html();
    var date = new Date(new Date().getTime() + opt.countdown * 1000);
    let countDownInterval = dom.data('countDownInterval');
    if (countDownInterval) {
        clearInterval(countDownInterval);
        dom.data('countDownInterval', null);
    }
    countDownInterval = setInterval(function () {
        if (new Date() >= date && countDownInterval) {
            clearInterval(countDownInterval);
            dom.removeClass('disabled');
            opt.onCountdownEnd(dom, content);
        } else {
            opt.onCountdown(dom, date);
        }
    }, opt.interval * 1000);
    dom.data('countDownInterval', countDownInterval);
};
export let getBrowserType = function () {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串

    var isOpera = userAgent.indexOf('Opera') > -1;
    if (isOpera) {
        return 'Opera'
    }

    if (userAgent.indexOf('Firefox') > -1) {
        return 'Firefox';
    }
    if (userAgent.indexOf('Chrome') > -1) {
        return 'Chrome';
    }

    if (userAgent.indexOf('Safari') > -1) {
        return 'Safari';
    }

    if (userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 && !isOpera) {
        return 'IE';
    }
};

export let getTree = function (list: any[], parent, tree?, key = 'key', parentKey = 'parentKey') {
    var rootTree = tree || {};
    var itemTree = {};

    function setTree(list, parent, tree, key, parentKey) {
        $(list).each(function (i) {
            let item: any = this;
            if (!itemTree[item[key]])
                itemTree[item[key]] = {item: item, inRoot: false};
            if (item[parentKey] == parent) {
                itemTree[item[key]].inRoot = true;
                if (!tree[item[key]]) {
                    tree[item[key]] = itemTree[item[key]];
                    tree[item[key]].child = {};
                }
                setTree(list, item[key], tree[item[key]].child, key, parentKey);
            }
        });
    }

    setTree(list, '', rootTree, key, parentKey);
    return {
        rootTree,
        itemTree
    }
};

export let findInTree = function (tree, key) {
    if (tree) {
        if (tree[key])
            return tree[key];
        for (let k in tree) {
            let match = findInTree(tree[k].child, key);
            if (match)
                return match;
        }
    }
};

export let deleteIfEmpty = function (data) {
    for (let key in data) {
        let val = data[key];
        if (val === '' || val == null)
            delete data[key];
    }
}
//endregion