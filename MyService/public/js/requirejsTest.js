(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", 'underscore', 'SparkMD5', 'jquery', 'jquery-ui', 'jquery.cookie', 'bootstrap', 'ejs', 'socket.io', 'WdatePicker'], factory);
    }
})(function (require, exports) {
    let $ = require('jquery');
    let SparkMD5 = require('SparkMD5');
    let WdatePicker = require('WdatePicker');
    $('input').on('click', function () {
        var datePickerArgs = {
            el: this,
            //startDate: '#{%y-30}-01-01',
            doubleCalendar: true,
            dateFmt: 'yyyy-MM-dd',
            minDate: '1900-01-01',
        };
        WdatePicker(datePickerArgs);
    });
    exports.test = function () {
        console.log($.cookie('userInfoCacheKey'))
        console.log(SparkMD5.hash('123456'))
    }
});