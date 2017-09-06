/**
 * Created by bang on 2017-7-26.
 */
var extend = {
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
        $.ajax(opt).then(function (t) {
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
        return res;
    },
    parseJSON: function (str) {
        try {
            JSON.parse(str)
        } catch (e) {
            var reg = /JSON.parse:[\s\S]* at line ([\d]) column ([\d]) of the JSON data/;
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
                s: date.getSeconds()
            };
            return format.replace(/(y+|M+|d+|h+|H+|m+|s+)/g, function (e) {
                return ((e.length > 1 ? '0' : '') + eval('o.' + e.slice(-1))).slice(-(e.length > 2 ? e.length : 2))
            });
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
        for(var i = 0;i < split.length; i++){
            var m = split[i].length >= 3 && split[i].match(/\{(\d)\}/);
            if(m){
                var index = parseInt(m[1]);
                split[i] = split[i].replace('{' + index + '}', args[index + 1] || '');
            }
        }
        res = split.join('');
        return res;
    }
}