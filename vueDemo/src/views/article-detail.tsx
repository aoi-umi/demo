import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import moment from 'moment';

import { testApi } from '@/api';
import { myEnum, dev } from '@/config';
import { DetailType } from './article-mgt-detail';

@Component
export default class ArticleDetail extends Vue {

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
        this.$refs
        let query = this.$route.query;
        try {
            let rs = await testApi.articleDetailQuery({ _id: query._id });
            this.updateDetail(rs);
        } catch (e) {
            this.$Message.error(e.message);
        }

    }

    render() {
        return this.renderContent();
    }

    renderHeader() {
        let { detail } = this.innerDetail;
        return (
            <div>
                {detail._id && [
                    '状态: ' + detail.statusText,
                    '作者:' + detail.user.nickname + '(' + detail.user.account + ')',
                    '创建于: ' + moment(detail.createdAt).format(dev.dateFormat),
                ].map(ele => {
                    return (<span style={{ marginRight: '5px' }}>{ele}</span>);
                })}
            </div>
        );
    }

    renderContent() {
        let { detail } = this.innerDetail;
        return (
            <div>
                <h1>{detail.title}</h1>
                <br />
                {this.renderHeader()}
                <br />
                <div class="ql-editor" domPropsInnerHTML={detail.content}>
                </div>
            </div>
        );
    }
}
