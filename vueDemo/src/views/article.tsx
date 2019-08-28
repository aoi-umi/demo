import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import moment from 'moment';
import { testApi } from '@/api';
import { myEnum, authority, dev } from '@/config';
import { Card, Input, Row, Col, Icon, Divider, Time, Checkbox } from '@/components/iview';
import { MyList, IMyList, Const as MyTableConst, ResultType } from '@/components/my-list';
import { MyImg } from '@/components/my-img';
import { convert, convClass } from '@/helpers';
import { DetailDataType } from './article-mgt-detail';
import { UserAvatarView } from './comps/user-avatar';
import { Base } from './base';
import { MyTag } from '@/components/my-tag';

@Component
export default class Article extends Base {
    $refs: { list: IMyList<any> };

    anyKey = '';

    mounted() {
        this.query();
    }

    @Watch('$route')
    route(to, from) {
        this.query();
    }

    query() {
        let list = this.$refs.list;
        let query = this.$route.query;
        list.setQueryByKey(query, ['user', 'title', 'anyKey']);
        convert.Test.queryToListModel(query, list.model);
        this.$refs.list.query(query);
    }

    protected delSuccessHandler() {
        this.$refs.list.query();
    }

    protected render() {
        return (
            <div>
                <Input v-model={this.anyKey} search on-on-search={() => {
                    this.$refs.list.handleQuery({ resetPage: true });
                }} />
                <MyList
                    ref="list"
                    hideSearchBox

                    type="custom"
                    customRenderFn={(rs) => {
                        if (!rs.success || !rs.data.length) {
                            let msg = !rs.success ? rs.msg : '暂无数据';
                            return (
                                <Card style={{ marginTop: '5px', textAlign: 'center' }}>{msg}</Card>
                            );
                        }
                        return rs.data.map(ele => {
                            return (
                                <ArticleListItemView value={ele} />
                            );
                        });
                    }}

                    queryFn={async (data) => {
                        let rs = await testApi.articleQuery(data);
                        return rs;
                    }}

                    on-query={(model) => {
                        let q = { ...model.query, anyKey: this.anyKey };
                        this.$router.push({
                            path: this.$route.path,
                            query: {
                                ...q,
                                ...convert.Test.listModelToQuery(model),
                            }
                        });
                    }}
                >
                </MyList>
            </div >
        );
    }
}


@Component
class ArticleListItem extends Base {
    @Prop({
        required: true
    })
    value: DetailDataType;

    @Prop({
        default: false
    })
    selectable?: boolean;

    @Prop()
    mgt?: boolean;

    private toDetail(ele: DetailDataType) {
        if (this.mgt) {
            return;
        }
        this.$router.push({
            path: dev.routeConfig.articleDetail.path,
            query: { _id: ele._id }
        });
    }

    private handleVote(detail, value) {
        this.operateHandler('', async () => {
            let rs = await testApi.voteSubmit({ ownerId: detail._id, value, type: myEnum.voteType.文章 });
            for (let key in rs) {
                detail[key] = rs[key];
            }
            detail.voteValue = value;
        }, {
                noSuccessHandler: true
            });
    }

    render() {
        let ele = this.value;
        return (
            <div>
                <Card style={{ marginTop: '5px', cursor: this.mgt ? '' : 'pointer' }}>
                    <Row>
                        <Col style={{ marginLeft: '40px', display: 'flex', }} nativeOn-click={() => {
                            this.toDetail(ele);
                        }}>
                            <h3 class="article-list-title" style={{ display: 'inline' }} title={ele.title}>{ele.title}</h3>
                            <div style={{
                                flex: '1 1 auto',
                                alignSelf: 'stretch',
                            }} on-click={() => {
                                this.toDetail(ele);
                            }}>
                            </div>
                            {this.selectable && <Checkbox value={ele._checked} disabled={ele._disabled} on-on-change={(checked) => {
                                this.$emit('selected-change', checked);
                            }} />}
                        </Col>
                        <Col style={{
                            marginTop: '2px', marginBottom: '2px',
                            display: 'flex',
                            alignItems: 'center',
                        }}>
                            <UserAvatarView user={ele.user} tipsPlacement="bottom-start" />
                            {this.mgt && <span class="not-important" style={{ marginLeft: '5px' }} on-click={() => {
                                this.toDetail(ele);
                            }}>创建于 <Time time={new Date(ele.createdAt)} /></span>}
                            {ele.publishAt && <span class="not-important" style={{ marginLeft: '5px' }} on-click={() => {
                                this.toDetail(ele);
                            }}>发布于 <Time time={new Date(ele.publishAt)} /></span>}
                            <div style={{
                                flex: '1 1 auto',
                                alignSelf: 'stretch',
                            }} on-click={() => {
                                this.toDetail(ele);
                            }}>
                            </div>
                            {this.mgt && <MyTag value={ele.statusText} />}
                        </Col>
                    </Row>
                    <Row style={{ marginLeft: '40px' }} nativeOn-click={() => {
                        this.toDetail(ele);
                    }}>
                        <Col style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                        }}>
                            {ele.coverUrl && <MyImg class=" my-upload-item cover" style={{
                                border: '1px solid #e2e4e6',
                                borderRadius: '5px',
                                marginRight: '5px',
                                marginBottom: '5px',
                            }} src={ele.coverUrl} />}
                            <p style={{
                                overflowY: 'hidden', maxHeight: '150px', minWidth: '200px', whiteSpace: 'pre-wrap'
                            }}>{ele.profile || dev.defaultArticleProfile}</p>
                        </Col>
                    </Row>
                    <Divider size="small" />
                    {this.$slots.default || (!this.mgt ?
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
                                            this.toDetail(ele);
                                        })} >
                                        <Icon
                                            type={iconEle.icon}
                                            size={24}
                                            color={iconEle.color} />
                                        <b style={{ marginLeft: '4px' }}>{iconEle.text}</b>
                                    </div>
                                );
                            })}
                        </div> :
                        <div />)}
                </Card>
            </div>
        )
    }
}

export const ArticleListItemView = convClass<ArticleListItem>(ArticleListItem);