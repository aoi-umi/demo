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
    createToken:function(str){
        return $.md5(str);
    },
    ajax: function(option){
        var opt = {
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        };
        opt = $.extend(opt, option);
        if(!opt.data)
            opt.data = {};
        if(typeof opt.data != 'string')
            opt.data = JSON.stringify(opt.data);
        var res = $.Deferred();
        $.ajax(opt).then(function (t) {
            if(!t.result) {
                var err = new Error(t.desc);
                err.code = t.detail;
                return $.Deferred().reject(err);
            }
            else
                return $.Deferred().resolve(t.detail);
        }).then(function (t) {
            res.resolve(t);
        }).fail(function (e) {
            if(!e)
                e = new Error();
            if(e.statusText){
                e = new Error(e.statusText);
                e.code = status;
            }
            res.reject(e);
        });
        return res;
    }
}