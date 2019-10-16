import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import moment from 'dayjs';

import { testApi } from '@/api';
import { myEnum, dev } from '@/config';
import { routerConfig } from '@/router';
import { FormItem, Button, Divider } from '@/components/iview';
import { MyEditor, IMyEditor } from '@/components/my-editor';
import { ArticleMgtBase } from './article-mgt';
import { UserAvatarView } from '../comps/user-avatar';

import { ContentDetailType, ContentDataType, ContentMgtDetail, ContentMgtDetailView, ContentLogListView } from './content-mgt-base';

import './article.less';

export type DetailDataType = ContentDataType & {
    content: string;
};
export type DetailType = ContentDetailType<DetailDataType>;

@Component
export default class ArticleMgtDetail extends ArticleMgtBase {
    stylePrefix = "article-mgt-";
    $refs: { detailView: ContentMgtDetail, editor: IMyEditor };

    private innerDetail: DetailType = this.getDetailData();
    protected getDetailData() {
        let data = this.getDefaultDetail<DetailDataType>();
        data.detail.content = '';
        data.detail.status = myEnum.articleStatus.草稿;
        data.detail.statusText = myEnum.articleStatus.getKey(data.detail.status);
        return data;
    }

    private getRules() {
        return {
            content: [
                { required: true, trigger: 'blur' }
            ],
        };
    }

    private async loadDetailData() {
        let query = this.$route.query;
        let detail: DetailType;
        if (query._id) {
            this.preview = this.$route.path == routerConfig.articleMgtDetail.path;
            detail = await testApi.articleMgtDetailQuery({ _id: query._id });
            if (query.repost) {
                detail.detail._id = '';
            }
        } else {
            detail = this.getDetailData() as any;
        }
        this.innerDetail = detail;
        return detail;
    }

    private async saveFn(detail: DetailDataType, submit) {
        let { user, ...restDetail } = detail;
        let rs = await testApi.articleMgtSave({
            ...restDetail,
            submit
        });
        return rs;
    }

    protected renderHeader(detail: ContentDataType) {
        return (
            <div>
                <UserAvatarView user={detail.user} />
                {[
                    '状态: ' + detail.statusText,
                    '创建于: ' + moment(detail.createdAt).format(dev.dateFormat),
                    detail.publishAt && ('发布于:' + moment(detail.publishAt).format(dev.dateFormat)),
                ].map(ele => {
                    return (<span class="not-important" style={{ marginLeft: '5px' }}>{ele}</span>);
                })}
            </div>
        );
    }

    protected renderLog() {
        let { log } = this.innerDetail;
        return (
            <ContentLogListView log={log} />
        );
    }

    renderPreview() {
        let { detail } = this.innerDetail;
        let operate = this.getOperate(detail, { noPreview: true, isDetail: true });
        return (
            <div>
                <h1>{detail.title}</h1>
                <br />
                {this.renderHeader(detail)}
                <br />
                <div class="ql-editor" domPropsInnerHTML={detail.content}>
                </div>
                {operate.length > 0 && <Divider size='small' />}
                <div>
                    {operate.map(ele => {
                        return (
                            <Button type={ele.type as any} on-click={ele.fn}>
                                {ele.text}
                            </Button>
                        );
                    })}
                </div>
                {this.renderLog()}
                {this.renderDelConfirm()}
                {this.renderNotPassConfirm()}
            </div>
        );
    }

    uploadFile = [];
    async fileChangeHandler(file) {
        //todo 判断是否同一文件
        let match = this.uploadFile.find(ele => ele.file === file);
        if (!match) {
            try {
                let t = await testApi.imgUpload(file);
                match = {
                    file,
                    url: t.url,
                };
                this.uploadFile.push(match);
            } catch (e) {
                this.$Notice.error({
                    title: '上传出错',
                    desc: e,
                });
            }
        }
        if (match)
            this.$refs.editor.insertEmbed('image', match.url);
    }

    render() {
        let { detail } = this.innerDetail;
        return (
            <ContentMgtDetailView ref="detailView"
                preview={this.preview}
                loadDetailData={this.loadDetailData}
                getRules={this.getRules}
                saveFn={this.saveFn}
                saveSuccessFn={this.toList}
                renderPreviewFn={this.renderPreview}
            >
                <FormItem label="内容" prop="content">
                    <MyEditor ref="editor" class={this.getStyleName('detail-content')}
                        v-model={detail.content}
                        placeholder='输点啥。。。'
                        on-img-change={(file) => {
                            this.fileChangeHandler(file);
                        }} />
                </FormItem>
            </ContentMgtDetailView>
        )
    }
}
