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
    self?: boolean;

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
            <Poptip trigger="hover" style={{ cursor: 'pointer' }} placement={this.placement}>
                <Avatar icon="md-person" style={{ marginRight: '10px' }} />
                <b>{this.user.nickname}</b>
                {this.self ?
                    <div slot="content">
                        <p class="ivu-select-item" on-click={() => {
                            this.$router.push(dev.routeConfig.userInfo.path);
                        }}>主页</p>
                        <p class="ivu-select-item" on-click={this.signOut}>退出</p>
                    </div> :
                    <div slot="content">
                        这里写简介
                    </div>
                }
            </Poptip>
        );
    }
}

export const UserAvatarView = convClass<UserAvatar>(UserAvatar);