import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import * as iviewTypes from 'iview';

import { testApi, testSocket } from '@/api';
import { dev, myEnum, authority } from '@/config';
import { routerConfig } from '@/router';
import { convClass } from '@/components/utils';
import { Button, Avatar, Poptip, Spin } from '@/components/iview';
import { MyImgViewer, IMyImgViewer } from '@/components/my-img-viewer';
import { Base } from '../base';
import { DetailDataType } from '../user/user-mgt';
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

    private userDetail: DetailDataType = {};
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
        for (let key in routerConfig) {
            let rtCfg = routerConfig[key];
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
        if (!this.self && (!this.userDetail._id || this.userDetail._id != this.user._id)) {
            this.operateHandler('', async () => {
                this.loadFailMsg = '';
                this.loading = true;
                this.userDetail = await testApi.userDetailQuery(this.user._id);
            }, { noDefaultHandler: true }).then(rs => {
                if (!rs.success)
                    this.loadFailMsg = '获取用户信息出错';
            }).finally(() => {
                this.loading = false;
            });
        }
    }

    render() {
        let loadFail = !!this.loadFailMsg;
        let notSelf = this.user._id !== this.storeUser.user._id;
        return (
            <div style={{ display: 'inline-block' }}>
                <Poptip class="pointer" disabled={this.noTips} trigger="hover" style={{
                    // zIndex: 10
                }} placement={this.tipsPlacement} on-on-popper-show={() => {
                    this.getUserDetail();
                }}>
                    {this.$slots.default}
                    {this.self ?
                        <div slot="content">
                            <p class="ivu-select-item" on-click={() => {
                                this.$router.push(routerConfig.userInfo.path);
                            }}>主页</p>
                            <p class="ivu-select-item" on-click={this.signOut}>退出</p>
                        </div> :
                        <div slot="content" style={{ position: 'relative', margin: '2px' }}>
                            {loadFail ?
                                <div style={{ textAlign: 'center' }}>
                                    {this.loadFailMsg}
                                </div> :
                                <div>
                                    {this.loading && <Spin fix />}
                                    <div style={{ textAlign: 'center' }}>
                                        <Avatar class="shadow" icon="md-person" src={this.userDetail.avatarUrl} size="large"
                                            nativeOn-click={() => {
                                                if (this.avatarUrl) {
                                                    this.$refs.imgViewer.show();
                                                }
                                            }} />

                                        <div class="not-important">{this.user.nickname}({this.user.account})</div>
                                    </div>
                                    <br />
                                    {this.userDetail.profile || dev.defaultProfile}
                                    <br />
                                    关注: {this.userDetail.following}  粉丝: {this.userDetail.follower}
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
                                        path: routerConfig.userInfo.path,
                                        query: { _id: this.user._id }
                                    });
                                }}>主页</Button>
                                {!loadFail && notSelf && <FollowButtonView user={this.userDetail} />}
                                {notSelf && <Button on-click={() => {
                                    this.$router.push({
                                        path: routerConfig.userChat.path,
                                        query: { _id: this.user._id }
                                    });
                                }}>私信</Button>}
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