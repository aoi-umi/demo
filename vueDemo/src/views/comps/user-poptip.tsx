import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import * as iviewTypes from 'iview';

import { testApi, testSocket } from '@/api';
import { convClass } from '@/helpers';
import { dev, myEnum, authority } from '@/config';
import { Button, Avatar, Poptip, Spin } from '@/components/iview';
import { MyImgViewer, IMyImgViewer } from '@/components/my-img-viewer';
import { Base } from '../base';
import { DetailDataType } from '../user-mgt';
import { FollowButtonView } from './follow-button';

export type User = {
    _id?: string;
    nickname?: string;
    account?: string;
    avatarUrl?: string;
    followStatus?: number;
    followEachOther?: boolean;
};
@Component
class UserPoptip extends Base {
    @Prop()
    user: User;

    @Prop()
    noTips?: boolean;

    @Prop()
    self?: boolean;

    @Prop()
    showAccount?: boolean;

    @Prop()
    hideAvatar?: boolean;

    @Prop({
        default: 'right-start'
    })
    tipsPlacement: iviewTypes.Poptip['placement'];

    @Prop()
    size: iviewTypes.Avatar['size'];

    private innerUser: DetailDataType = {};
    avatarUrl = '';

    $refs: { imgViewer: IMyImgViewer };

    created() {
        this.init(this.user);
    }

    private init(user: User) {
        this.avatarUrl = (user && user.avatarUrl) || '';
    }

    @Watch('user')
    watchUser(newVal, oldVal) {
        this.init(newVal);
    }

    signOut() {
        let token = localStorage.getItem(dev.cacheKey.testUser);
        if (token) {
            testApi.userSignOut();
            testSocket.logout({ [dev.cacheKey.testUser]: token });
        }
        for (let key in dev.routeConfig) {
            let rtCfg = dev.routeConfig[key];
            if (rtCfg.path === this.$route.path) {
                if (rtCfg.authority && rtCfg.authority.includes(authority.login))
                    this.$router.go(0);
                break;
            }
        }
        this.storeUser.setUser(null);
    }
    loading = false;
    loadFailMsg = '';
    getUserDetail() {
        if (!this.self && (!this.innerUser._id || this.innerUser._id != this.user._id)) {
            this.operateHandler('', async () => {
                this.loadFailMsg = '';
                this.loading = true;
                this.innerUser = await testApi.userDetailQuery(this.user._id);
            }, { noDefaultHandler: true }).then(rs => {
                if (!rs.success)
                    this.loadFailMsg = '获取用户信息出错';
            }).finally(() => {
                this.loading = false;
            });
        }
    }

    render() {
        return (
            <div style={{ display: 'inline-block' }}>
                <Poptip disabled={this.noTips} trigger="hover" style={{
                    cursor: 'pointer',
                    // zIndex: 10
                }} placement={this.tipsPlacement} on-on-popper-show={() => {
                    this.getUserDetail();
                }}>
                    {this.$slots.default}
                    {this.self ?
                        <div slot="content">
                            <p class="ivu-select-item" on-click={() => {
                                this.$router.push(dev.routeConfig.userInfo.path);
                            }}>主页</p>
                            <p class="ivu-select-item" on-click={this.signOut}>退出</p>
                        </div> :
                        <div slot="content" style={{ position: 'relative', margin: '2px' }}>
                            {!!this.loadFailMsg ?
                                <div style={{ textAlign: 'center' }}>
                                    {this.loadFailMsg}
                                </div> :
                                <div>
                                    {this.loading && <Spin fix />}
                                    <div style={{ textAlign: 'center' }}>
                                        <Avatar class="shadow" icon="md-person" src={this.innerUser.avatarUrl} size="large"
                                            nativeOn-click={() => {
                                                if (this.avatarUrl) {
                                                    this.$refs.imgViewer.show();
                                                }
                                            }} />

                                        <div class="not-important">{this.user.nickname}({this.user.account})</div>
                                    </div>
                                    <br />
                                    {this.innerUser.profile || dev.defaultProfile}
                                    <br />
                                    关注: {this.innerUser.following}  粉丝: {this.innerUser.follower}
                                </div>
                            }
                            <br />
                            <div style={{ textAlign: 'center' }}>
                                {!!this.loadFailMsg &&
                                    <Button on-click={() => {
                                        this.getUserDetail();
                                    }}>重试</Button>}
                                <Button on-click={() => {
                                    this.$router.push({
                                        path: dev.routeConfig.userInfo.path,
                                        query: { _id: this.user._id }
                                    });
                                }}>主页</Button>
                                {this.user._id !== this.storeUser.user._id && [
                                    <FollowButtonView user={this.user} />,
                                    <Button on-click={() => {
                                        this.$router.push({
                                            path: dev.routeConfig.userChat.path,
                                            query: { _id: this.user._id }
                                        });
                                    }}>私信</Button>]}
                            </div>
                        </div>
                    }
                </Poptip>
                {this.avatarUrl && <MyImgViewer src={this.avatarUrl} ref='imgViewer' />}
            </div>
        );
    }
}

export const UserPoptipView = convClass<UserPoptip>(UserPoptip);