import { Component, Vue, Watch } from 'vue-property-decorator';

import { testApi, testSocket } from '@/api';
import { Spin, Avatar, Button, Card } from '@/components/iview';
import { MyLoad } from '@/components/my-load';
import { myEnum, dev } from '@/config';

import { Base } from './base';
import './wx-auth.less';
import { SignUpView } from './user/user-sign';
import { LocalStore } from '@/store';

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

    }

    wxUserInfo: WxUserInfo;
    loading = false;
    val = '';
    async auth() {
        let query: any = this.$route.query;
        this.val = query.code;
        try {
            this.wxUserInfo = null;
            this.loading = true;
            //dev
            if (this.wxUserInfo) { }
            else if (!query.getUserInfo) {
                let rs = await testApi.wxGetCode();
                window.location.href = rs;
            } else {
                this.wxUserInfo = await testApi.wxGetUserInfo({ code: this.val });
            }
        } finally {
            this.loading = false;
        }
        if (this.wxUserInfo)
            this.checkAccount(this.val);
        return this.wxUserInfo;
    }

    accountChecking = false;
    accountMsg = '';
    account: { _id?: string };
    by = myEnum.userBy.微信授权;
    async checkAccount(val) {
        try {
            this.accountMsg = '';
            this.accountChecking = true;
            this.account = await testApi.userAccountExists({ val, by: this.by });
        } catch (e) {
            this.accountMsg = e.message;
        } finally {
            this.accountChecking = false;
        }
    }

    signInLoading = false;
    async signInByCode() {
        await this.operateHandler('登录', async () => {
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

    render() {
        return (
            <MyLoad
                loadFn={this.auth}
                renderFn={(userInfo: WxUserInfo) => {
                    if (!userInfo)
                        return <div />;
                    return (
                        <Card class={this.getStyleName('user-info-card')}>
                            <div class={this.getStyleName('user-info')}>
                                <Avatar src={userInfo.headimgurl} size="large" />
                                <span>{userInfo.nickname}</span>
                                <div class={this.getStyleName('op')}>
                                    {this.accountChecking ? <Spin /> :
                                        this.accountMsg ? this.accountMsg : this.renderOperate()
                                    }
                                </div>
                            </div>
                        </Card>
                    );
                }}
            />
        );
    }

    private renderOperate() {
        return (
            this.storeUser.user.isLogin ?
                <span>已登录</span> :
                this.account ?
                    <Button loading={this.signInLoading} on-click={() => { this.signInByCode(); }}>登录</Button> :
                    <SignUpView account={this.wxUserInfo.nickname} by={myEnum.userBy.微信授权} byVal={this.val} />

        );

    }
}