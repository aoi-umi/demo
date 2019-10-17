import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { myEnum } from '@/config';
import { testApi } from '@/api';
import { Icon } from '@/components/iview';
import { convClass } from '@/components/utils';

import { Base } from '../base';
import { ContentDataType } from './content-mgt-base';

@Component
class ContentOperate extends Base {
    @Prop({
        required: true
    })
    data: ContentDataType;

    @Prop({
        required: true
    })
    voteType: number;

    @Prop()
    toDetail: () => void;

    private handleVote(detail, value) {
        this.operateHandler('', async () => {
            let rs = await testApi.voteSubmit({ ownerId: detail._id, value, type: this.voteType });
            for (let key in rs) {
                detail[key] = rs[key];
            }
            detail.voteValue = value;
        }, {
            noSuccessHandler: true
        });
    }

    render() {
        let ele = this.data;
        return (
            <div style={{ display: 'flex' }}>
                {[{
                    icon: 'md-eye',
                    text: ele.readTimes,
                }, {
                    icon: 'md-text',
                    text: ele.commentCount
                }, {
                    icon: 'md-thumbs-up',
                    text: ele.like,
                    color: ele.voteValue == myEnum.voteValue.喜欢 ? 'red' : '',
                    onClick: () => {
                        this.handleVote(ele, ele.voteValue == myEnum.voteValue.喜欢 ? myEnum.voteValue.无 : myEnum.voteValue.喜欢);
                    }
                }, {
                    icon: 'md-thumbs-down',
                    text: ele.dislike,
                    color: ele.voteValue == myEnum.voteValue.不喜欢 ? 'red' : '',
                    onClick: () => {
                        this.handleVote(ele, ele.voteValue == myEnum.voteValue.不喜欢 ? myEnum.voteValue.无 : myEnum.voteValue.不喜欢);
                    }
                }].map(iconEle => {
                    return (
                        <div class="center" style={{ flex: 1 }}
                            on-click={iconEle.onClick || (() => {
                                this.toDetail && this.toDetail();
                            })} >
                            <Icon
                                type={iconEle.icon}
                                size={24}
                                color={iconEle.color} />
                            <b style={{ marginLeft: '4px' }}>{iconEle.text}</b>
                        </div>
                    );
                })}
            </div>
        );
    }
}

export const ContentOperateView = convClass<ContentOperate>(ContentOperate);