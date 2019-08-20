import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import moment from 'moment';

import { testApi } from '@/api';
import { myEnum, dev } from '@/config';
import { DetailType, DetailDataType } from './article-mgt-detail';
import { CommentView } from './comment';
import { Divider, Spin } from '@/components/iview';
import { UserAvatarView } from './user-avatar';
import { Base } from './base';
import { LoadView, ILoadView } from './load-view';

@Component
export default class ArticleDetail extends Base {

    $refs: { loadView: ILoadView };

    mounted() {
        this.$refs.loadView.loadData();
    }

    render() {
        return (
            <LoadView
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
                            <h1>{detail.title}</h1>
                            <br />
                            {this.renderHeader(detail)}
                            <br />
                            <div class="ql-editor" domPropsInnerHTML={detail.content}>
                            </div>
                            <Divider size='small' />
                            {detail._id && <CommentView ownerId={detail._id} type={myEnum.commentType.文章} />}
                        </div>
                    );
                }} />
        );
    }

    renderHeader(detail: DetailDataType) {
        return (
            <div>
                <UserAvatarView user={detail.user} tipsPlacement="top-start" />
                {[
                    '发布于: ' + moment(detail.publishAt).format(dev.dateFormat),
                ].map(ele => {
                    return (<span class="not-important" style={{ marginLeft: '5px' }}>{ele}</span>);
                })}
            </div>
        );
    }
}
