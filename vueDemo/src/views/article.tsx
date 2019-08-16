import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import moment from 'moment';
import { testApi } from '@/api';
import { myEnum, authority, dev } from '@/config';
import { Card, Input, Row, Col, Icon, Divider } from '@/components/iview';
import { MyList, IMyList, Const as MyTableConst } from '@/components/my-list';
import { MyImg } from '@/components/my-img';
import { convert } from '@/helpers';
import { DetailDataType } from './article-mgt-detail';
import { UserAvatarView } from './user-avatar';
import { Base } from './base';

@Component
export default class Article extends Base {
    $refs: { list: IMyList<any> };

    page: any;
    anyKey = '';
    protected created() {
        let query = this.$route.query;
        this.page = { index: query.page, size: query.rows };
    }

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

    private toDetail(ele: DetailDataType) {
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

    protected render() {
        return (
            <div>
                <Input v-model={this.anyKey} search on-on-search={() => {
                    this.$refs.list.handleQuery({ resetPage: true });
                }} />
                <MyList
                    ref="list"
                    current={this.page.index}
                    pageSize={this.page.size}
                    hideSearchBox

                    type="custom"
                    customRenderFn={(rs) => {
                        if (!rs.success || !rs.data.length) {
                            let msg = !rs.success ? rs.msg : '暂无数据';
                            return (
                                <Card style={{ marginTop: '5px', textAlign: 'center' }}>{msg}</Card>
                            );
                        }
                        return rs.data.map((ele: DetailDataType) => {
                            let iconList = [{
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
                            }];
                            return (
                                <Card style={{ marginTop: '5px', cursor: 'pointer' }}>
                                    <Row>
                                        <Col xs={4}>
                                            <UserAvatarView user={ele.user} tipsPlacement="top-start" />
                                        </Col>
                                        <Col xs={20} nativeOn-click={() => {
                                            this.toDetail(ele);
                                        }}>
                                            <h3 class="article-list-title" title={ele.title}>{ele.title}</h3>
                                            创建于 {moment(ele.createdAt).format(dev.dateFormat)}
                                        </Col>
                                    </Row>
                                    <Row nativeOn-click={() => {
                                        this.toDetail(ele);
                                    }}>
                                        <Col xs={4}><MyImg class="cover" src={ele.coverUrl} /></Col>
                                        <Col xs={20} style={{ overflowY: 'hidden', maxHeight: '150px' }}>
                                            <p domPropsInnerHTML={ele.content}></p>
                                        </Col>
                                    </Row>
                                    <Divider size="small" />
                                    <Row>
                                        {iconList.map(iconEle => {
                                            return (
                                                <Col xs={24 / iconList.length} style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}
                                                    nativeOn-click={iconEle.onClick || (() => {
                                                        this.toDetail(ele);
                                                    })} >
                                                    <Icon
                                                        type={iconEle.icon}
                                                        size={24}
                                                        color={iconEle.color} />
                                                    <b style={{ marginLeft: '4px' }}>{iconEle.text}</b>
                                                </Col>
                                            );
                                        })}
                                    </Row>
                                </Card>
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
            </div>
        );
    }
}