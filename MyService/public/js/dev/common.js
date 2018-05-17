/**
 * Created by bang on 2017-7-26.
 */
(function (factory) {
    namespace('common', factory(require, {}));
})(function (require, exports) {
    let common = exports;
    exports.stringToBase64 = function (str) {
        return btoa(encodeURIComponent(str));
    };
    exports.base64ToString = function (base64Str) {
        return decodeURIComponent(atob(base64Str));
    };
    exports.s4 = function (count) {
        var str = '';
        if (typeof count == 'undefined')
            count = 1;
        if (count <= 0) {

        } else {
            for (var i = 0; i < count; i++) {
                str += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }
        }
        return str;
    };
    exports.guid = function () {
        var self = this;
        var s4 = self.s4;
        return (s4(2) + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4(3));
    };
    exports.md5 = function (str) {
        return SparkMD5.hash(str);
    };
    exports.md5File = function (file) {
        return common.promise(function (defer) {
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
            return defer;
        });
    };
    exports.createToken = function (str) {
        return common.md5(str);
    };
    exports.ajax = function (option) {
        var opt = {
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',

            //自定义参数
            myDataCheck: null,
        };
        opt = $.extend(opt, option);
        var originReq = opt.data;
        if (!opt.data)
            opt.data = {};
        if (typeof opt.data != 'string')
            opt.data = JSON.stringify(opt.data);
        var resOpt = {
            req: originReq
        };
        var res = $.Deferred();
        common.promise(function () {
            if (typeof opt.myDataCheck == 'function') {
                try {
                    opt.myDataCheck();
                } catch (e) {
                    return $.Deferred().reject(e);
                }
            }
            return $.ajax(opt);
        }).then(function (t) {
            if (!t.result) {
                if (typeof t.desc == 'object')
                    t.desc = JSON.stringify(t.desc);
                var err = new Error();
                err.responseJSON = t;
                return $.Deferred().reject(err);
            }
            else
                return $.Deferred().resolve(t.detail);
        }).then(function (t) {
            res.resolve(t, resOpt);
        }).fail(function (e) {
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
            res.reject(e, resOpt);
        });
        return res;
    };
    exports.parseJSON = function (str) {
        try {
            return JSON.parse(str)
        } catch (e) {
            var browserType = common.getBrowserType();
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
    exports.dataCheck = function (option) {
        var self = this;
        var data = {
            success: false,
            model: {},
            desc: '',
            err: null,
            dom: null
        };
        if (!option) return data;
        //示例
        //var dict = {
        //    name: 'Password',
        //    desc: '密码',
        //    dom: $('#password'),
        //    focusDom: $('#password'),
        //    canNotNull: true,
        //    canNotNullDesc: '请输入{0}',
        //    isTrim: false,
        //    getValue: function () {
        //        return this.dom.find("option:selected").text();
        //    },
        //    checkValue: function (value, model) {
        //        if (!value) {
        //            return ('密码只能由8~20位字母和数字组成');
        //        }
        //    }
        //}
        for (var i = 0; i < option.list.length; i++) {
            var noName = false;
            var t = option.list[i];
            var name = (t.desc || t.name);
            data.dom = t.focusDom || t.dom;
            if (typeof t.isTrim == 'undefined') t.isTrim = true;
            if (!t.canNotNullDesc) t.canNotNullDesc = '{0}不能为空';
            var checkOpt = {};
            try {
                var value = '';
                var typeOfGetValue = typeof t.getValue;
                switch (typeOfGetValue) {
                    case 'function':
                        value = t.getValue(data.model);
                        break;
                    case 'string':
                        if (typeof t.dom[t.getValue] == 'function') value = t.dom[t.getValue]();
                        else value = t.dom[t.getValue];
                        break;
                    default:
                        value = t.dom.val();
                        break;
                }
                if (typeof value == 'string') {
                    //if (t.dom && value == t.dom.attr('placeholder'))
                    //    value = '';
                    if (t.isTrim)
                        value = $.trim(value);
                }
                data.model[t.name] = value;
                if (t.canNotNull && (value === '' || value == null || typeof value == 'undefined')) {
                    noName = true;
                    throw self.stringFormat(t.canNotNullDesc, name);
                }
                if (t.checkValue) {
                    var err = t.checkValue(value, data.model, checkOpt);
                    if (err) {
                        noName = true;
                        throw self.stringFormat(err, name);
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
    exports.dateParse = function (date) {
        if (typeof date == 'string')
            date = date.replace(/-/g, '/');
        if (!isNaN(date) && !isNaN(parseInt(date)))
            date = parseInt(date);
        if (!(date instanceof Date))
            date = new Date(date);
        return date;
    };
    exports.dateFormat = function (date, format) {
        try {
            if (!format) format = 'yyyy-MM-dd';
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
                if (e.match(/S+/))
                    return ('' + o[e.slice(-1)]).slice(0, e.length);
                else
                    return ((e.length > 1 ? '0' : '') + o[e.slice(-1)]).slice(-(e.length > 2 ? e.length : 2));
            });
            return formatStr;
        } catch (e) {
            console.log(e);
            return '';
        }
    };
    exports.getDateDiff = function (date1, date2) {
        date1 = common.dateParse(date1);
        date2 = common.dateParse(date2);

        var isMinus = false;
        //date1 开始日期 ，date2 结束日期
        var timestamp = date2.getTime() - date1.getTime(); //时间差的毫秒数
        if (date1 > date2) {
            timestamp = date1.getTime() - date2.getTime();
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

    //字符串
    exports.stringFormat = function () {
        var args = arguments;
        var reg = /(\{\d\})/g
        var res = args[0] || '';
        var split = res.split(reg);
        for (var i = 0; i < split.length; i++) {
            var m = split[i].length >= 3 && split[i].match(/\{(\d)\}/);
            if (m) {
                var index = parseInt(m[1]);
                split[i] = split[i].replace('{' + index + '}', args[index + 1] || '');
            }
        }
        res = split.join('');
        return res;
    };
    exports.stringToPascal = function (str) {
        str = str.replace(/_([a-zA-Z])/g, function () {
            return arguments[1].toUpperCase();
        });
        return str[0].toUpperCase() + str.substr(1);
    };

    exports.msgNotice = function (option) {
        var opt = {
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
        //btnOpt = {
        // class:'btn-default'
        // content:123,
        // cbOpt:123,
        // cb:function(opt){}
        // }

        //type 0
        //在target四周显示

        //type 1
        //弹出提示
        var dom = null;
        opt = $.extend(opt, option);
        switch (opt.type) {
            case 0:
                if (true) {
                    if (!opt.target && opt.dom)
                        opt.target = opt.dom.selector;
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
                    dom.css({ 'left': x, 'top': y })
                        .show();
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
                }
                break;
            case 1:
                if (true) {
                    if (!opt.template) {
                        opt.template = `<div data-backdrop="static" role="dialog" tabindex="-1" class="modal fade msg-notice-1">
                            <div class="modal-dialog" >
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
                            var item = this;
                            var btn = $(opt.btnTemplate);
                            var btnClass = item.class || 'btn-default';
                            btn.addClass(btnClass);
                            if (btn.hasClass('btn-content'))
                                btn.html(item.content);
                            else
                                btn.find('.btn-content').html(item.content);
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
                    if (dom.is(':hidden'))
                        dom.modal('show');
                }
                break;
        }
        return dom;
    };
    exports.isInArray = function (obj, list, startIndex) {
        return $.inArray(obj, list, startIndex) >= 0;
    };
    exports.promise = function (fn) {
        var def = $.Deferred();
        var defer = $.Deferred();
        def.resolve();
        return def.then(function () {
            let result;
            try {
                result = fn(defer);
            } catch (e) {
                return $.Deferred().reject(e);
            }
            return result;
        });
    };

    exports.getArgsFromUrlParams = function () {
        var args = new Object();
        var query = location.search.substring(1);//获取查询串
        var params = query.split('&');
        for (var i = 0; i < params.length; i++) {
            var pos = params[i].indexOf('=');
            if (pos == -1) continue;
            var argname = params[i].substring(0, pos);
            var value = params[i].substring(pos + 1);
            args[argname] = unescape(value);
        }
        return args;
    };
    exports.getUrlParamsFromArgs = function (args) {
        var list = [];
        for (var i in args) {
            list.push(i + '=' + escape(args[i]));
        }
        return list.join('&');
    };

    exports.autoComplete = function (opt) {
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
            var match = _.filter(request.sourceList, function (t) {
                return opt.match(request.term, t);
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
                if (typeof opt.source == 'function') {
                    source = opt.source();
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
    exports.setCountdown = function (option) {
        //seconds
        var opt = {
            countdown: 10,
            interval: 1,
            onCountdown: function (dom, endDate) {
                dom.html(common.getDateDiff(new Date(), endDate));
            },
            onCountdownEnd: function (dom, content) {
                dom.html(content);
            }
        };
        var opt = $.extend(opt, option);
        var dom = opt.dom;
        if (dom.hasClass('disabled'))
            return;
        dom.addClass('disabled');
        if (this.countDownInterval) {
            clearInterval(this.countDownInterval);
        }
        var content = dom.html();
        var date = new Date(new Date().getTime() + opt.countdown * 1000);
        dom.countDownInterval = this.countDownInterval = setInterval(function () {
            if (new Date() >= date && dom.countDownInterval) {
                clearInterval(dom.countDownInterval);
                dom.removeClass('disabled');
                opt.onCountdownEnd(dom, content);
            } else {
                opt.onCountdown(dom, date);
            }
        }, opt.interval * 1000);
    };

    exports.error = function (msg, errCode) {
        var err = new Error(msg);
        err.code = errCode;
        return err;
    };
    exports.getBrowserType = function () {
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
    return exports;
});