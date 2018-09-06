import * as common from './common';
import * as myInterface from './myInterface';
import * as myVaild from './myVaild';
import errorConfig from './errorConfig';

export let init = function () {
    bindEvent();
};
export let bindEvent = function () {
    //登录框
    $(document).on('click', '.sign-in', function () {
        $('#signInBox').modal('show');
        $('#signInBox').find('[name=changeCaptcha]').trigger('click');
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
            common.msgNotice({ type: 1, msg: e.message });
        });
    });
    $(document).on('click', '[name=changeCaptcha]', function () {
        $('[name=captchaBox]').data('captchaKey', '').empty();
        $('[name=captchaErr]').text('');
        myInterface.api.captchaGet().then(t => {
            $('[name=captchaBox]').data('captchaKey', t.key).html(t.svg);
        }).catch(e => {
            $('[name=captchaErr]').text(e.message);
        });
    });

    $('#signUp').on('click', function () {
        signUp();
    });
    refreshCaptcha();
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
    }, {
        name: 'captcha',
        desc: '验证码',
        dom: form.find('[name=captcha]'),
        canNotNull: true,
    }];
    common.promise(function () {
        var opt = { list: signInArgsOpt };
        var checkRes = common.dataCheck(opt);
        if (!checkRes.success) {
            if (checkRes.dom) {
                common.msgNotice({ dom: checkRes.dom, msg: checkRes.desc });
            } else {
                throw common.error(checkRes.desc);
            }
        } else {
            var model: any = checkRes.model;
            var data = {
                random: common.s4(2),
                captcha: model.captcha,
                captchaKey: $('[name=captchaBox]').data('captchaKey')
            };
            var token = common.createToken(model.account + common.md5(model.password) + JSON.stringify(data));
            var headers = {
                'account': model.account,
                'token': token,
            };
            var req = {
                headers: headers,
            };
            return myInterface.api.signIn(data, req).then(function (t) {
                if (location.pathname == '/user/signIn') {
                    var args = common.getArgsFromUrlParams();
                    location.href = args.toUrl || ('/?noNav=' + (args.noNav || ''));
                }
                else {
                    form.find('[name=captcha]').val('');
                    $('#signInBox').modal('hide');
                    $('.nav-nickname').text(t.nickname);
                    $('.nav-sign').addClass('in');
                }
            });
        }
    }).fail(function (e: any) {
        let msg = '登录失败';
        let btnOptList;
        if (e) {
            if (e.message) msg = e.message;
            if (e.code == errorConfig.CAPTCHA_EXPIRE.code) {
                btnOptList = {
                    returnValue: 'refreshCaptcha'
                }
            }
        }
        common.msgNotice({ type: 1, msg: msg, btnOptList }).waitClose().then(t => {
            if(t == 'refreshCaptcha')
                refreshCaptcha();
        });
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
        var opt = { list: signUpArgsOpt };
        var checkRes = common.dataCheck(opt);
        var err = null;
        if (!checkRes.success) {
            if (checkRes.dom) {
                common.msgNotice({ target: checkRes.dom.selector, msg: checkRes.desc });
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
                returnValue: 'accept'                
            }]
        }).waitClose().then(val => {
            if(val == 'accept') {
                location.href = '/';
            }
        });
    }).fail(function (e: any) {
        if (e)
            common.msgNotice({ type: 1, msg: e.message });
    });
};

let refreshCaptcha = function(){
    $('[name=changeCaptcha]:visible').trigger('click');
}