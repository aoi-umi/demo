import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { convClass } from '@/components/utils';
import { Spin, Button, Card } from '@/components/iview';
import { myEnum } from '@/config';
import { testApi } from '@/api';
import { Base } from "../base";
import { User } from './user-avatar';


@Component
class FollowBotton extends Base {
    @Prop({
        required: true
    })
    user: User;

    private innerUser = this.user;

    get isFollow() {
        return this.innerUser.followStatus === myEnum.followStatus.已关注;
    }

    @Watch('user')
    watchUser(newVal, oldVal) {
        this.innerUser = newVal;
    }

    private async handleFollow() {
        let status = this.isFollow ? myEnum.followStatus.已取消 : myEnum.followStatus.已关注;
        this.operateHandler(this.isFollow ? '取消关注' : '关注', async () => {
            let rs = await testApi.followSave({ userId: this.user._id, status });
            this.innerUser = {
                ...this.innerUser,
                followStatus: rs.status,
                followEachOther: rs.followEachOther,
            };
        });
    }

    render() {
        return (
            <Button on-click={() => {
                this.handleFollow();
            }}>{this.innerUser.followEachOther ?
                    '相互关注' :
                    this.isFollow ? '已关注' : '关注'}
            </Button>
        );
    }
}


export const FollowButtonView = convClass<FollowBotton>(FollowBotton);
export interface IFollowBottonView extends FollowBotton { };