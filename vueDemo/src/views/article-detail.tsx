import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import moment from 'moment';

import { testApi } from '@/api';
import { myEnum, dev } from '@/config';
import { DetailType } from './article-mgt-detail';
import { CommentView } from './comment';
import { Divider } from '@/components/iview';
import { UserAvatarView } from './user-avatar';
import { Base } from './base';

@Component
export default class ArticleDetail extends Base {

    updateDetail(newVal?) {
        let data = newVal || { detail: {} };
        this.initDetail(data);
    }
    private innerDetail: DetailType = {} as any;

    private initDetail(data) {
        this.innerDetail = data;
    }

    created() {
        this.updateDetail();
        this.loadDetail();
    }

    async loadDetail() {
        let query = this.$route.query;
        this.operateHandler('', async () => {
            let rs = await testApi.articleDetailQuery({ _id: query._id });
            this.updateDetail(rs);
        });
    }

    render() {
        let { detail } = this.innerDetail;
        return (
            <div>
                <h1>{detail.title}</h1>
                <br />
                {this.renderHeader()}
                <br />
                <div class="ql-editor" domPropsInnerHTML={detail.content}>
                </div>
                <Divider size='small' />
                {detail._id && <CommentView ownerId={detail._id} type={myEnum.commentType.文章} />}
            </div>
        );
    }

    renderHeader() {
        let { detail } = this.innerDetail;
        let list = [];
        if (detail._id) {
            list = [
                <UserAvatarView user={detail.user} placement="top-start" />,
                ...[
                    '创建于: ' + moment(detail.createdAt).format(dev.dateFormat),
                ].map(ele => {
                    return (<span style={{ marginLeft: '5px' }}>{ele}</span>);
                })
            ]
        }
        return (
            <div>
                {list}
            </div>
        );
    }
}
