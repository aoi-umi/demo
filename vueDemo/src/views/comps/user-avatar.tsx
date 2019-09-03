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
import { UserPoptipView } from './user-poptip';

export type User = {
    _id?: string;
    nickname?: string;
    account?: string;
    avatarUrl?: string;
    followStatus?: number;
    followEachOther?: boolean;
};
@Component
class UserAvatar extends Base {
    @Prop()
    user: User;

    @Prop()
    showAccount?: boolean;

    @Prop()
    size: iviewTypes.Avatar['size'];

    @Prop()
    noTips?: boolean;

    @Prop()
    isAuthor?: boolean;

    @Prop()
    self?: boolean;

    @Prop({
        default: 'right-start'
    })
    tipsPlacement: iviewTypes.Poptip['placement'];

    avatarUrl = '';

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


    render() {
        return (
            <div>
                <UserPoptipView
                    user={this.user}
                    tipsPlacement={this.tipsPlacement}
                    noTips={this.noTips}
                    self={this.self}
                >
                    <Avatar
                        class="shadow"
                        icon="md-person"
                        size={this.size}
                        src={this.avatarUrl}
                        style={{ marginRight: '10px' }}
                    />
                </UserPoptipView>
                <span class="not-important">{this.user.nickname}{this.showAccount && `(${this.user.account})`}{this.isAuthor && `(作者)`}</span>
            </div>
        );
    }
}

export const UserAvatarView = convClass<UserAvatar>(UserAvatar);