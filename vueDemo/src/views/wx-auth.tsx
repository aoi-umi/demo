import { Component, Vue, Watch } from 'vue-property-decorator';

import { testApi, testSocket } from '@/api';
import { Spin, Avatar, Button, Card } from '@/components/iview';
import { MyLoad } from '@/components/my-load';
import { myEnum, dev } from '@/config';

import { Base } from './base';
import './wx-auth.less';
import { SignUpView } from './user/user-sign';
import { LocalStore } from '@/store';
import { routerConfig } from '@/router';

type WxUserInfo = {
    openid: string;
    nickname: string;
    sex: number;
    language: string;
    city: string;
    province: string;
    country: string;
    headimgurl: string;
    privilege: string[];
};
@Component
export default class WxAuth extends Base {
    stylePrefix = "wx-auth-";
    mounted() {
        this.auth();
    }

    @Watch('$route')
    private watchRouter() {
        this.auth();
    }

    wxUserInfo: WxUserInfo;
    loading = false;
    val = '';
    type = '';
    async auth() {
        let query: any = this.$route.query;
        this.val = query.code;
        let type = this.type = query.type;
        try {
            this.wxUserInfo = null;
            this.loading = true;
            if (query.getUserInfo) {
                this.wxUserInfo = await testApi.wxGetUserInfo({ code: this.val });
            } else {
                if ((type === myEnum.wxAuthType.绑定 && this.storeUser.user.isLogin)
                    || type === myEnum.wxAuthType.登录 && !this.storeUser.user.isLogin) {
                    let rs = await testApi.wxGetCode();
                    window.location.href = rs;
                }
            }
        } catch (e) {
            this.msg = e.message;
        } finally {
            this.loading = false;
        }
        if (this.wxUserInfo)
            this.checkAccount(this.val);
        return this.wxUserInfo;
    }

    accountChecking = false;
    msg = '';
    account: { _id?: string };
    by = myEnum.userBy.微信授权;
    async checkAccount(val) {
        try {
            this.msg = '';
            this.accountChecking = true;
            this.account = await testApi.userAccountExists({ val, by: this.by });
        } catch (e) {
            this.msg = e.message;
        } finally {
            this.accountChecking = false;
        }
    }

    signInLoading = false;
    signInByCode() {
        this.operateHandler('登录', async () => {
            this.signInLoading = true;
            let req = { by: this.by, val: this.val };
            let rs = await testApi.userSignInByAuth(req);
            let token = rs.key;
            LocalStore.setItem(dev.cacheKey.testUser, token);
            testSocket.login({ [dev.cacheKey.testUser]: token });
            this.storeUser.setUser(rs);
        }).finally(() => {
            this.signInLoading = false;
        });
    }

    bindLoading = false;
    async userBind() {
        try {
            this.msg = '';
            this.bindLoading = true;
            let data = { by: this.by, val: this.val };
            await testApi.userBind(data);
            this.msg = '绑定成功';
        } catch (e) {
            this.msg = e.message;
        } finally {
            this.bindLoading = false;
        }
    }

    render() {
        return (
            <Card class={this.getStyleName('user-info-card')}>
                {this.loading ? <Spin fix /> :
                    <div>
                        {
                            this.msg ?
                                <div class={this.getStyleName('err')}>
                                    {this.msg}
                                    <Button on-click={() => {
                                        this.$router.push(routerConfig.wxAuth.path);
                                    }}>重试</Button>
                                </div> :
                                this.storeUser.user.isLogin ?
                                    <div class={this.getStyleName('logined')}>
                                        <span>已登录</span>
                                        {this.type === myEnum.wxAuthType.绑定 &&
                                            <Button loading={this.bindLoading} on-click={() => { this.userBind(); }}>绑定</Button>
                                        }
                                    </div> :
                                    !this.wxUserInfo ? <div /> : this.renderUserInfo()
                        }
                    </div>
                }
            </Card>
        );
    }

    private renderUserInfo() {
        let userInfo = this.wxUserInfo;
        return (
            <div class={this.getStyleName('user-info')}>
                <Avatar src={userInfo.headimgurl} size="large" />
                <span>{userInfo.nickname}</span>
                <div class={this.getStyleName('op')}>
                    {this.accountChecking ?
                        <Spin /> :
                        this.account ?
                            <Button loading={this.signInLoading} on-click={() => { this.signInByCode(); }}>登录</Button> :
                            <SignUpView account={this.wxUserInfo.nickname} by={myEnum.userBy.微信授权} byVal={this.val} />
                    }
                </div>
            </div>

        );

    }
}