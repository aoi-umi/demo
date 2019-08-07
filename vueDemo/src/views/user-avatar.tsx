import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import moment from 'moment';
import * as iviewTypes from 'iview';

import { testApi } from '@/api';
import { convClass, convert } from '@/helpers';
import { Divider, Button, Avatar, Poptip } from '@/components/iview';
import { myEnum, dev } from '@/config';
import { Base } from './base';

@Component
class UserAvatar extends Base {
    @Prop()
    user: any;

    @Prop()
    noTips?: boolean;

    @Prop()
    self?: boolean;

    @Prop()
    showAccount?: boolean;

    @Prop()
    placement: iviewTypes.Poptip['placement'];

    signOut() {
        let token = localStorage.getItem(dev.cacheKey.testUser);
        if (token) {
            testApi.userSignOut();
        }
        this.storeUser.setUser(null);
    }

    render() {
        return (
            <Poptip disabled={this.noTips} trigger="hover" style={{ cursor: 'pointer' }} placement={this.placement}>
                <Avatar icon="md-person" style={{ marginRight: '10px' }} />
                <b>{this.user.nickname}{this.showAccount && `(${this.user.account})`}</b>
                {this.self ?
                    <div slot="content">
                        <p class="ivu-select-item" on-click={() => {
                            this.$router.push(dev.routeConfig.userInfo.path);
                        }}>主页</p>
                        <p class="ivu-select-item" on-click={this.signOut}>退出</p>
                    </div> :
                    <div slot="content">
                        <div style={{ textAlign: 'center' }}>
                            <Avatar icon="md-person" size="large" />
                        </div>
                        <br />
                        {this.user.desc || '这个人很懒,什么都没写'}
                        <br />
                        <br />
                        <div style={{ textAlign: 'center' }}>
                            <Button on-click={() => {
                                this.$router.push({
                                    path: dev.routeConfig.userInfo.path,
                                    query: { _id: this.user._id }
                                })
                            }}>主页</Button>
                        </div>
                    </div>
                }
            </Poptip>
        );
    }
}

export const UserAvatarView = convClass<UserAvatar>(UserAvatar);