import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import * as iviewTypes from 'iview';

import { convClass } from '@/components/utils';
import { Avatar } from '@/components/iview';
import { Base } from '../base';
import { UserPoptipView } from './user-poptip';

import './user-avatar.less';

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
    stylePrefix = 'comp-user-avatar-';
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
            <div class={this.getStyleName('root')}>
                <UserPoptipView
                    user={this.user}
                    tipsPlacement={this.tipsPlacement}
                    noTips={this.noTips}
                    self={this.self}
                >
                    <Avatar
                        class={this.getStyleName('avatar').concat('shadow')}
                        icon="md-person"
                        size={this.size}
                        src={this.avatarUrl}
                    />
                </UserPoptipView>
                <span class="not-important">{this.user.nickname}{this.showAccount && `(${this.user.account})`}{this.isAuthor && `(作者)`}</span>
            </div>
        );
    }
}

export const UserAvatarView = convClass<UserAvatar>(UserAvatar);