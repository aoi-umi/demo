import { Component, Vue, Watch } from 'vue-property-decorator';

import { testApi } from '@/api';
import { Spin, Avatar, Button, Card } from '@/components/iview';
import { MyLoad } from '@/components/my-load';
import { myEnum } from '@/config';

import { Base } from './base';
import './wx-auth.less';

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

    loading = false;
    async auth() {

        let query: any = this.$route.query;
        let userInfo: WxUserInfo;
        try {
            this.loading = true;
            //dev
            if (userInfo) { }
            else if (!query.getUserInfo) {
                let rs = await testApi.wxGetCode();
                window.location.href = rs;
            } else {
                userInfo = await testApi.wxGetUserInfo({ code: query.code });
            }
        } finally {
            this.loading = false;
        }
        if (userInfo)
            this.checkAccount(userInfo.openid);
        return userInfo;
    }

    accountChecking = false;
    account = {};
    async checkAccount(openId) {
        this.accountChecking = true;
        this.account = await testApi.userAccountExists({ val: openId, type: myEnum.userFindAccountType.微信openId });
        this.accountChecking = false;
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
                                    {this.accountChecking ?
                                        <Spin /> :
                                        (!this.account ?
                                            this.storeUser.user.isLogin ? <Button>绑定</Button> : <Button>注册</Button>
                                            : <Button>登录</Button>)
                                    }
                                </div>
                            </div>
                        </Card>
                    );
                }}
            />
        );
    }
}