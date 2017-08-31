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
    s4: function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    },
    guid: function () {
        var self = this;
        var s4 = self.s4;
        return (s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4());
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
        if (!opt.data)
            opt.data = {};
        if (typeof opt.data != 'string')
            opt.data = JSON.stringify(opt.data);
        var res = $.Deferred();
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
            res.resolve(t);
        }).fail(function (e) {
            if (!e)
                e = new Error();
            if (e.statusText) {
                e = new Error(e.statusText);
                e.code = status;
            }
            res.reject(e);
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
    }
}