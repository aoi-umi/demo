import * as common from './common';
import * as myInterface from './myInterface';
import * as myVaild from './myVaild';

export let init = function () {
    bindEvent();
};
export let bindEvent = function () {
    //登录框
    $(document).on('click', '.sign-in', function () {
        $('#signInBox').modal('show');
    });
    //登录
    $(document).on('keyup', '.sign-in-input', function (event) {
        if (event.which == 13)
            signIn($(this));
    });
    $(document).on('click', '[name=signIn]', function () {
        signIn($(this));
    });
    $(document).on('click', '.sign-out', function () {
        myInterface.api.signOut().then(function () {
            $('.nav-sign').removeClass('in');
        }).fail(function (e) {
            common.msgNotice({type: 1, msg: e.message});
        });
    });

    $('#signUp').on('click', function () {
        signUp();
    });
};
export let signIn = function (dom) {
    var form = dom.closest('.sign-in-form');
    var signInArgsOpt = [{
        name: 'account',
        desc: '用户名',
        dom: form.find('[name=account]'),
        canNotNull: true
    }, {
        name: 'password',
        desc: '密码',
        dom: form.find('[name=password]'),
        canNotNull: true,
    }];
    common.promise(function () {
        var opt = {list: signInArgsOpt};
        var checkRes = common.dataCheck(opt);
        var err = null;
        if (!checkRes.success) {
            if (checkRes.dom) {
                common.msgNotice({dom: checkRes.dom, msg: checkRes.desc});
            } else {
                err = new Error(checkRes.desc);
            }
            throw err;
        }
        var model: any = checkRes.model;
        var data = {random: common.s4(2)};
        var token = common.createToken(model.account + common.md5(model.password) + JSON.stringify(data));
        var headers = {
            'account': model.account,
            'token': token,
        };
        var req = {
            headers: headers,
        };
        return myInterface.api.signIn(data, req);
    }).then(function (t) {
        if (location.pathname == '/user/signIn') {
            var args = common.getArgsFromUrlParams();
            location.href = args.toUrl || ('/?noNav=' + (args.noNav || ''));
        }
        else {
            $('#signInBox').modal('hide');
            $('.nav-nickname').text(t.nickname);
            $('.nav-sign').addClass('in');
        }
    }).fail(function (e: any) {
        if (e)
            common.msgNotice({type: 1, msg: e.message});
    });
};
export let signUp = function () {

    var signUpArgsOpt = [{
        name: 'account',
        desc: '用户名',
        dom: $('#account'),
        canNotNull: true,
        checkValue: function (val) {
            if (!myVaild.isAccount(val))
                return '请输入正确的{0}';
        }
    }, {
        name: 'nickname',
        desc: '昵称',
        dom: $('#nickname'),
        canNotNull: true,
    }, {
        name: 'password',
        desc: '密码',
        dom: $('#password'),
        canNotNull: true,
        checkValue: function (val, model) {
            if (val.length < 6)
                return '请输入大于等于6位的{0}';
        }
    }, {
        name: 'passwordRepeat',
        desc: '密码',
        dom: $('#passwordRepeat'),
        canNotNull: true,
        checkValue: function (val, model) {
            if (val != model['password'])
                return '密码不一致';
        }
    }];
    common.promise(function () {
        var opt = {list: signUpArgsOpt};
        var checkRes = common.dataCheck(opt);
        var err = null;
        if (!checkRes.success) {
            if (checkRes.dom) {
                common.msgNotice({target: checkRes.dom.selector, msg: checkRes.desc});
            } else {
                err = new Error(checkRes.desc);
            }
            throw err;
        }
        checkRes.model.password = common.md5(checkRes.model.password);
        delete checkRes.model.passwordRepeat;
        return myInterface.api.signUp(checkRes.model);
    }).then(function (t) {
        common.msgNotice({
            type: 1, msg: 'success', btnOptList: [{
                cb: function () {
                    location.href = '/';
                }
            }]
        });
    }).fail(function (e: any) {
        if (e)
            common.msgNotice({type: 1, msg: e.message});
    });
};