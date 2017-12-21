namespace('userInfo');
userInfo = {
    init: function () {
        var self = this;
        self.bindEvent();
    },
    bindEvent: function () {
        var self = this;
        $('#save').on('click', function () {
            self.save();
        });
    },
    save: function () {
        common.promise().then(function (res) {
            var data = null;
            try {
                var saveArgsOpt = [{
                    name: 'nickname',
                    desc: '昵称',
                    dom: $('#nickname'),
                    canNotNull: true,
                }, {
                    name: 'password',
                    desc: '密码',
                    dom: $('#password'),
                }, {
                    name: 'newPassword',
                    desc: '新密码',
                    dom: $('#newPassword'),
                    checkValue: function (val, model, checkOpt) {
                        if (val && !model['password']) {
                            checkOpt.dom = $('#password');
                            return '请输入密码';
                        }
                    }
                }, {
                    name: 'newPasswordRepeat',
                    desc: '新密码',
                    dom: $('#newPasswordRepeat'),
                    checkValue: function (val, model) {
                        if (model['newPassword'] && val != model['newPassword'])
                            return '密码不一致';
                    }
                }];
                var checkRes = common.dataCheck({list: saveArgsOpt});
                if (checkRes) {
                    console.log(checkRes)
                    if (!checkRes.success) {
                        var err = null;
                        if (checkRes.dom) {
                            common.msgNotice({dom: checkRes.dom, msg: checkRes.desc});
                        } else {
                            err = new Error(checkRes.desc);
                        }
                        throw err;
                    }
                    data = checkRes.model;
                    if(data.newPassword){
                        data.newPassword = common.md5(data.newPassword);
                        data.password = common.md5(data.password);
                    }
                    var notice = common.msgNotice({type: 1, msg: '保存中...', noClose: true});
                    var method = 'userInfoSave';
                    return my.interface[method](data).always(function () {
                        notice.close();
                    });
                }
            } catch (e) {
                return $.Deferred().reject(e);
            }
        }).then(function () {
            common.msgNotice({
                type: 1, msg: '修改成功', btnOptList: [{
                    content: '确认',
                    cb: function () {
                        location.reload(true);
                    }
                }]
            })
        }).fail(function (e) {
            if (e)
                common.msgNotice({type: 1, msg: e.message});
        });
    }
};