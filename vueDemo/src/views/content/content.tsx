import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { myEnum, dev } from '@/config';
import { testApi } from '@/api';
import { routerConfig } from '@/router';
import { Icon, Card, Row, Col, Checkbox, Time, Divider } from '@/components/iview';
import { convClass } from '@/components/utils';
import { MyTag } from '@/components/my-tag';

import { Base } from '../base';
import { UserAvatarView } from '../comps/user-avatar';
import { ContentDataType } from './content-mgt-base';

import './content.less';

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

@Component
class ContentListItem extends Base {
    stylePrefix = "content-";
    @Prop({
        required: true
    })
    value: ContentDataType;

    @Prop({
        default: false
    })
    selectable?: boolean;

    @Prop()
    mgt?: boolean;

    @Prop({
        required: true
    })
    contentType: number;

    private cfgs = {
        [myEnum.contentType.文章]: {
            detailUrl: routerConfig.articleDetail.path,
            profile: dev.defaultArticleProfile,
            voteType: myEnum.voteType.文章,
        },
        [myEnum.contentType.视频]: {
            detailUrl: routerConfig.videoDetail.path,
            profile: dev.defaultVideoProfile,
            voteType: myEnum.voteType.视频,
        },
    };
    private cfg = this.cfgs[this.contentType];

    private toDetail(ele: ContentDataType) {
        if (this.mgt) {
            return;
        }
        this.$router.push({
            path: this.cfg.detailUrl,
            query: { _id: ele._id }
        });
    }

    render() {
        let ele = this.value;
        return (
            <div>
                <Card style={{ marginTop: '5px', cursor: this.mgt ? '' : 'pointer' }}>
                    <Row>
                        <Col class={this.getStyleName('top-col')} nativeOn-click={() => {
                            this.toDetail(ele);
                        }}>
                            <h3 class={[...this.getStyleName('list-title'), 'flex-stretch']} title={ele.title}>{ele.title}</h3>
                            {/* <div class="flex-stretch" on-click={() => {
                                this.toDetail(ele);
                            }}>
                            </div> */}
                            {this.mgt && <MyTag value={ele.statusText} />}
                            {this.selectable && <Checkbox value={ele._checked} disabled={ele._disabled} on-on-change={(checked) => {
                                this.$emit('selected-change', checked);
                            }} />}
                        </Col>
                        <Col class={this.getStyleName('user-col')}>
                            <UserAvatarView user={ele.user} />
                            {ele.publishAt && <span class="not-important" style={{ marginLeft: '5px' }} on-click={() => {
                                this.toDetail(ele);
                            }}>发布于 <Time time={new Date(ele.publishAt)} /></span>}
                            <div class="flex-stretch" on-click={() => {
                                this.toDetail(ele);
                            }}>
                            </div>
                        </Col>
                    </Row>
                    <Row class={this.getStyleName('content-row')} nativeOn-click={() => {
                        this.toDetail(ele);
                    }}>
                        <Col class={this.getStyleName('cover-col')}>
                            {ele.coverUrl && <img class={[...this.getStyleName('cover'), "my-upload-item cover"]} v-lazy={ele.coverUrl} />}
                            <p class={this.getStyleName('profile')}>{ele.profile || this.cfg.profile}</p>
                        </Col>
                        {this.mgt && <p class="not-important" on-click={() => {
                            this.toDetail(ele);
                        }}>创建于 <Time time={new Date(ele.createdAt)} /></p>}
                    </Row>
                    <Divider size="small" />
                    {this.$slots.default || (!this.mgt ?
                        <ContentOperateView data={ele} voteType={this.cfg.voteType} toDetail={() => {
                            this.toDetail(ele);
                        }} /> :
                        <div />)}
                </Card>
            </div>
        );
    }
}

export const ContentListItemView = convClass<ContentListItem>(ContentListItem);