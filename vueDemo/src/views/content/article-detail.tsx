import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import moment from 'dayjs';

import { testApi } from '@/api';
import { myEnum, dev } from '@/config';
import { Divider, Affix, Card } from '@/components/iview';
import { MyLoad, IMyLoad } from '@/components/my-load';
import { convClass } from '@/components/utils';

import { UserAvatarView } from '../comps/user-avatar';
import { Base } from '../base';
import { DetailType, DetailDataType } from './article-mgt-detail';
import { CommentView, Comment } from './comment';
import { ContentOperateView } from './content';

@Component
export default class ArticleDetail extends Base {

    $refs: { loadView: IMyLoad, comment: Comment };

    render() {
        return (
            <MyLoad
                ref="loadView"
                loadFn={async () => {
                    let query = this.$route.query;
                    let rs = await testApi.articleDetailQuery({ _id: query._id });
                    return rs;
                }}
                renderFn={(t: DetailType) => {
                    let { detail } = t;
                    return (
                        <div>
                            <ArticleDetailMainView data={detail} />
                            <Affix offset-bottom={40}>
                                <Card>
                                    <ContentOperateView data={detail} contentType={myEnum.contentType.文章} voteType={myEnum.voteType.文章} on-operate-click={(type) => {
                                        if (type === myEnum.contentOperateType.评论) {
                                            let el = this.$refs.comment.$el as HTMLElement;
                                            window.scrollTo(0, el.offsetTop);
                                        }
                                    }} />
                                </Card>
                            </Affix>
                            <Divider size='small' />
                            <CommentView ref='comment' ownerId={detail._id} ownUserId={detail.userId} type={myEnum.contentType.文章} />
                        </div>
                    );
                }} />
        );
    }
}

@Component
class ArticleDetailMain extends Base {
    stylePrefix = 'article-';

    @Prop({
        required: true
    })
    data: DetailDataType;

    renderHeader(detail: DetailDataType) {
        return (
            <div>
                <UserAvatarView user={detail.user} />
                {[
                    '发布于: ' + moment(detail.publishAt).format(dev.dateFormat),
                ].map(ele => {
                    return (<span class="not-important" style={{ marginLeft: '5px' }}>{ele}</span>);
                })}
            </div>
        );
    }

    render() {
        let detail = this.data;
        return (
            <div>
                <h1>{detail.title}</h1>
                <br />
                {this.renderHeader(detail)}
                <br />
                <div class="ql-snow">
                    <div class="ql-editor" domPropsInnerHTML={detail.content} />
                </div>
            </div >
        );
    }
}

export const ArticleDetailMainView = convClass<ArticleDetailMain>(ArticleDetailMain);
