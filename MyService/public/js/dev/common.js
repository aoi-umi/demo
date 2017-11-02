/**
 * Created by bang on 2017-7-26.
 */
namespace('common');
common = {
    stringToBase64: function (str) {
        return btoa(encodeURIComponent(str));
    },
    base64ToString: function (base64Str) {
        return decodeURIComponent(atob(base64Str));
    },
    s4: function (count) {
        var str = '';
        if (typeof count == 'undefined')
            count = 1;
        if (count <= 0) {

        } else {
            for (i = 0; i < count; i++) {
                str += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }
        }
        return str;
    },
    guid: function () {
        var self = this;
        var s4 = self.s4;
        return (s4(2) + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4(3));
    },
    createToken: function (str) {
        return $.md5(str);
    },
    ajax: function (option) {
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
        var res = $.Deferred();
        var resOpt = {
            req: originReq
        };
        var def = $.Deferred();
        def.then(function () {
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
                var err = new Error(t.desc);
                err.code = t.detail;
                return $.Deferred().reject(err);
            }
            else
                return $.Deferred().resolve(t.detail);
        }).then(function (t) {
            res.resolve(t, resOpt);
        }).fail(function (e) {
            if (!e)
                e = new Error();
            if (e.statusText) {
                e = new Error(e.statusText);
                e.code = e.status;
            }
            res.reject(e, resOpt);
        });

        def.resolve();
        return res;
    },
    parseJSON: function (str) {
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
    },
    dateFormat: function (date, format) {
        try {
            if (!format)format = 'yyyy-MM-dd';
            if (!date)
                date = new Date();
            if (typeof date == 'string')
                date = Date.parse(date);

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
                    return ('' + eval('o.' + e.slice(-1))).slice(0, e.length);
                else
                    return ((e.length > 1 ? '0' : '') + eval('o.' + e.slice(-1))).slice(-(e.length > 2 ? e.length : 2));
            });
            return formatStr;
        } catch (ex) {
            return '';
        }
    },
    dataCheck: function (option) {
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
                    var err = t.checkValue(value, data.model);
                    if (err) {
                        noName = true;
                        throw self.stringFormat(err, name);
                    }
                }
            } catch (e) {
                if (e && e.message) e = e.message;
                var errStr = (typeof e == 'object') ? JSON.stringify(e) : e;
                data.desc = (noName ? '' : name) + errStr;
                data.err = e;
                return data;
            }
        }
        data.success = true;
        return data;
    },
    stringFormat: function () {
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
    },
    msgNotice: function (option) {
        var opt = {
            type: 0,
            msg: '',
            template: '',

            //type 0 参数
            target: '',
            position: 'right',
            autoHide: true,
            focus: true,

            //type 1 参数
            noClose: false,
            btnTemplate: `<button class="btn" type="button" name="btnContent" style="margin: 0 5px"></button>`,
            btnOptList: null,
            dom: null
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
        switch (opt.type){
            case 0:
                if(true){
                    if(!opt.target)
                        throw new Error('target can not be null');
                    if(!opt.msg)
                        throw new Error('msg can not be null');
                    if(!opt.template){
                        opt.template = '<div class="popover right" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>';
                    }
                    dom = $('[data-target="' + opt.target + '"]');
                    if(!dom.length){
                        dom = $(opt.template);
                        $('body').append(dom);
                    }
                    dom.attr('data-target', opt.target).find('.popover-content').html(opt.msg);
                    dom.removeClass('top bottom left right').addClass(opt.position);
                    var x = 0, y = 0;
                    var targetDom = $(opt.target);
                    switch(opt.position){
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
                    dom.css('left', x)
                        .css('top', y)
                        .show();
                    dom.close = function(){
                        dom.remove();
                    };
                    if(opt.focus)
                        targetDom.focus();
                    if(opt.autoHide){
                        targetDom.on('blur', function(){
                            dom.remove();
                        });
                    }
                }
                break;
            case 1:
                if(true){
                    opt.template =
                        `<div data-backdrop="static" role="dialog" tabindex="-1" class="modal fade">
                            <div class="modal-dialog" style="top:100px">
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
                    //dom = $('#msgNoticeBox');
                    dom = opt.dom;
                    if(!dom || !dom.length) {
                        dom = $(opt.template).attr('id', 'msgNoticeBox_' + new Date().getTime());
                        dom.find('[name=closeBtn]').on('click', function(){
                            dom.close();
                        });
                    }
                    if(opt.noClose)
                        dom.find('[name=closeBtn]').addClass('hidden');
                    else
                        dom.find('[name=closeBtn]').removeClass('hidden');
                    dom.find('[name=content]').html(opt.msg);
                    dom.find('[name=footer]').empty();
                    if(!opt.btnOptList && !opt.noClose) {
                        opt.btnOptList = [{
                            content: '确认'
                        }];
                    }
                    if(opt.btnOptList){
                        var btnList = [];
                        $(opt.btnOptList).each(function(){
                            var item = this;
                            var btn = $(opt.btnTemplate);
                            var btnClass = item.class || 'btn-default';
                            btn.addClass(btnClass);
                            if(btn.attr('name') == 'btnContent')
                                btn.html(item.content);
                            else
                                btn.find('[name=btnContent]').html(item.content);
                            btn.on('click', function(){
                                dom.close();
                                if(item.cb)
                                    item.cb(item.cbOpt);
                            });
                            btnList.push(btn);
                        });
                        dom.find('[name=footer]').append(btnList);
                    }
                    $('.popover').hide();
                    if(dom.is(':hidden'))
                        dom.modal('show');
                    dom.close = function() {
                        dom.modal('hide');
                    }
                }
                break;
        }
        return dom;
    },
    isInArray: function(obj, list, startIndex){
        return $.inArray(obj, list, startIndex) >= 0;
    },
    promise: function(){
        var def = $.Deferred();
        var res = $.Deferred();
        def.resolve(res);
        return def;
    },

    getArgsFromUrlParams: function () {
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
    },
    getUrlParamsFromArgs: function (args) {
        var list = [];
        for (var i in args) {
            list.push(i + '=' + escape(args[i]));
        }
        return list.join('&');
    },
};