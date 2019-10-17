import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { testApi } from '@/api';
import { myEnum, authority, dev } from '@/config';
import { routerConfig } from '@/router';
import { convert } from '@/helpers';
import { convClass } from '@/components/utils';
import { Card, Input, Row, Col, Icon, Divider, Time, Checkbox } from '@/components/iview';
import { MyList, IMyList } from '@/components/my-list';
import { MyTag } from '@/components/my-tag';

import { UserAvatarView } from '../comps/user-avatar';
import { ListBase } from '../comps/list-base';
import { Base } from '../base';
import { DetailDataType } from './article-mgt-detail';
import { ContentOperateView } from './content';

import './article.less';

@Component
export default class Article extends ListBase {
    $refs: { list: IMyList<any> };

    anyKey = '';

    query() {
        let list = this.$refs.list;
        let query;
        if (!this.notQueryOnRoute) {
            query = this.$route.query;
            list.setQueryByKey(query, ['user', 'title', 'anyKey']);
        } else {
            query = {};
        }
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
                        let rs = await testApi.articleQuery({ ...data, ...this.queryOpt });
                        return rs;
                    }}

                    on-query={(model, noClear, list: IMyList<any>) => {
                        let q = {
                            ...model.query, anyKey: this.anyKey,
                            ...convert.Test.listModelToQuery(model),
                        };
                        if (!this.notQueryToRoute) {
                            this.$router.push({
                                path: this.$route.path,
                                query: q
                            });
                        } else {
                            list.query(q);
                        }
                    }}
                >
                </MyList>
            </div >
        );
    }
}

export const ArticleView = convClass<Article>(Article);

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

    stylePrefix = "article-";

    private toDetail(ele: DetailDataType) {
        if (this.mgt) {
            return;
        }
        this.$router.push({
            path: routerConfig.articleDetail.path,
            query: { _id: ele._id }
        });
    }

    render() {
        let ele = this.value;
        return (
            <div>
                <Card style={{ marginTop: '5px', cursor: this.mgt ? '' : 'pointer' }}>
                    <Row>
                        <Col style={{ marginLeft: '40px', display: 'flex', alignItems: 'baseline' }} nativeOn-click={() => {
                            this.toDetail(ele);
                        }}>
                            <h3 class={this.getStyleName('list-title')} style={{ display: 'inline' }} title={ele.title}>{ele.title}</h3>
                            <div class="flex-stretch" on-click={() => {
                                this.toDetail(ele);
                            }}>
                            </div>
                            {this.mgt && <MyTag value={ele.statusText} />}
                            {this.selectable && <Checkbox value={ele._checked} disabled={ele._disabled} on-on-change={(checked) => {
                                this.$emit('selected-change', checked);
                            }} />}
                        </Col>
                        <Col style={{
                            marginTop: '2px', marginBottom: '2px',
                            display: 'flex',
                            alignItems: 'center',
                        }}>
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
                    <Row style={{ marginLeft: '40px' }} nativeOn-click={() => {
                        this.toDetail(ele);
                    }}>
                        <Col style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                        }}>
                            {ele.coverUrl && <img class="my-upload-item cover" style={{
                                border: '1px solid #e2e4e6',
                                borderRadius: '5px',
                                marginRight: '5px',
                                marginBottom: '5px',
                            }} v-lazy={ele.coverUrl} />}
                            <p style={{
                                overflowY: 'hidden', maxHeight: '150px', minWidth: '200px', whiteSpace: 'pre-wrap'
                            }}>{ele.profile || dev.defaultArticleProfile}</p>
                        </Col>
                        {this.mgt && <p class="not-important" on-click={() => {
                            this.toDetail(ele);
                        }}>创建于 <Time time={new Date(ele.createdAt)} /></p>}
                    </Row>
                    <Divider size="small" />
                    {this.$slots.default || (!this.mgt ?
                        <ContentOperateView data={ele} voteType={myEnum.voteType.文章} toDetail={() => {
                            this.toDetail(ele);
                        }} /> :
                        <div />)}
                </Card>
            </div>
        )
    }
}

export const ArticleListItemView = convClass<ArticleListItem>(ArticleListItem);