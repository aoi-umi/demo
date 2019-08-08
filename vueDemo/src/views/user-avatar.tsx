import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import * as iviewTypes from 'iview';

import { testApi } from '@/api';
import { convClass } from '@/helpers';
import { Button, Avatar, Poptip, Spin } from '@/components/iview';
import { dev } from '@/config';
import { Base } from './base';
import { DetailDataType } from './user-mgt';

@Component
class UserAvatar extends Base {
    @Prop()
    user: {
        _id?: string;
        nickname?: string;
        account?: string;
    };

    @Prop()
    noTips?: boolean;

    @Prop()
    self?: boolean;

    @Prop()
    showAccount?: boolean;

    @Prop()
    tipsPlacement: iviewTypes.Poptip['placement'];

    private innerUser: DetailDataType = {};
    avatarUrl = '';

    created() {
        this.init(this.user);
    }

    private init(user) {
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
            <Poptip disabled={this.noTips} trigger="hover" style={{ cursor: 'pointer' }} placement={this.tipsPlacement} on-on-popper-show={() => {
                this.getUserDetail();
            }}>
                <Avatar class="shadow" icon="md-person" src={this.avatarUrl} style={{ marginRight: '10px' }} />
                <b>{this.user.nickname}{this.showAccount && `(${this.user.account})`}</b>
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
                                    <Avatar class="shadow" icon="md-person" src={this.innerUser.avatarUrl} size="large" />
                                </div>
                                <br />
                                {this.innerUser.profile || dev.defaultProfile}
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
                        </div>
                    </div>
                }
            </Poptip>
        );
    }
}

export const UserAvatarView = convClass<UserAvatar>(UserAvatar);