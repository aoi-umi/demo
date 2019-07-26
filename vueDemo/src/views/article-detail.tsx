import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Form as IForm } from 'iview';
import moment from 'moment';

import { testApi } from '@/api';
import { myEnum, dev } from '@/config';
import { Modal, Input, Form, FormItem, Button, Checkbox, Switch, Transfer, Divider } from '@/components/iview';
import { MyUpload } from '@/components/my-upload';
import { ArticleBase } from './article';

export type DetailDataType = {
    _id: string;
    cover: string;
    coverUrl: string;
    title: string;
    content: string;
    status: number;
    statusText: string;
    createdAt: string;
    canUpdate: boolean;
    canDel: boolean;
    user: any;
};
@Component
export default class ArticleDetail extends ArticleBase {

    updateDetail(newVal?) {
        let data = newVal || this.getDetailData();
        this.initDetail(data);
    }
    private innerDetail: DetailDataType = {} as any;
    private preview = false;
    private getDetailData() {
        return {
            _id: '',
            cover: '',
            title: '',
            content: '',
            status: myEnum.articleStatus.草稿
        };
    }

    private initDetail(data) {
        this.innerDetail = data;
    }

    private rules = {
        title: [
            { required: true, trigger: 'blur' }
        ],
        content: [
            { required: true, trigger: 'blur' }
        ],
    };
    $refs: { formVaild: IForm, quillEditor: any };

    created() {
        this.loadDetail();
    }

    async loadDetail() {
        this.$refs
        let query = this.$route.query;
        if (query._id) {
            this.preview = this.$route.path == dev.routeConfig.articleDetail.path;
            try {
                let rs = await testApi.articleDetailQuery({ _id: query._id });
                this.updateDetail(rs);
            } catch (e) {
                this.$Message.error(e.message);
            }
        } else {
            this.updateDetail();
        }
    }

    saving = false;
    async save(submit: boolean) {
        this.saving = true;
        let detail = this.innerDetail;
        try {
            let rs = await testApi.articleSave({
                _id: detail._id,
                cover: detail.cover,
                title: detail.title,
                content: detail.content,
                submit
            });
            this.$Message.info({
                content: '提交成功', onClose: () => {
                    this.$router.push(dev.routeConfig.article);
                }
            });
        } catch (e) {
            this.$Message.error('出错了:' + e.message);
        } finally {
            this.saving = false;
        }
    }

    saveClickHandler(submit?: boolean) {
        this.$refs.formVaild.validate((valid) => {
            if (!valid) {
                this.$Message.error('参数有误');
            } else {
                this.save(submit);
            }
        });
    }

    render() {
        if (!this.preview)
            return this.renderEdit();
        return this.renderPreview();
    }

    renderHeader() {
        let detail = this.innerDetail;
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

    renderEdit() {
        let detail = this.innerDetail;
        return (
            <div>
                <h3>{detail._id ? '修改' : '新增'}</h3>
                <Form label-width={50} ref="formVaild" props={{ model: detail }} rules={this.rules}>
                    {detail._id &&
                        <FormItem label="" prop="">
                            {this.renderHeader()}
                        </FormItem>
                    }
                    <FormItem label="封面" prop="cover">
                        <MyUpload
                            headers={testApi.defaultHeaders}
                            uploadUrl={testApi.imgUploadUrl}
                            successHandler={(res, file) => {
                                let rs = testApi.imgUplodaHandler(res);
                                file.url = rs.url;
                                detail.cover = rs.fileId;
                            }}
                            // format={['jpg']}
                            width={160} height={90}
                            defaultFileList={detail.coverUrl ? [{
                                url: detail.coverUrl
                            }] : []}

                        />
                    </FormItem>
                    <FormItem label="标题" prop="title">
                        <Input v-model={detail.title} />
                    </FormItem>
                    <FormItem label="内容" prop="content">
                        <quill-editor ref="quillEditor" class="article-detail-content-editor" v-model={detail.content} options={{
                            placeholder: '输点啥。。。',
                            modules: {
                                toolbar: {
                                    container: [
                                        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                                        ['blockquote', 'code-block'],

                                        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                        [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
                                        [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
                                        [{ 'direction': 'rtl' }],                         // text direction

                                        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

                                        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                                        [{ 'font': [] }],
                                        [{ 'align': [] }],
                                        ['link', 'image']//'formula','video'
                                    ],
                                    handlers: {
                                        image: (value) => {
                                            if (value) {
                                                console.log(value);
                                            } else {
                                                this.$refs.quillEditor.quill.format('image', false);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        }></quill-editor>
                    </FormItem>
                    <Divider size='small' />
                    {(!detail._id || detail.canUpdate) &&
                        <FormItem>
                            <Button on-click={() => {
                                this.saveClickHandler(false);
                            }} loading={this.saving}>保存草稿</Button>
                            <Button type="primary" on-click={() => {
                                this.saveClickHandler(true);
                            }} loading={this.saving}>发布</Button>
                        </FormItem>
                    }
                </Form>
            </div >
        );
    }

    renderPreview() {
        let detail = this.innerDetail;
        let operate = this.getOperate(detail, { noPreview: true, noEdit: true });
        return (
            <div>
                <h1>{detail.title}</h1>
                <br />
                {this.renderHeader()}
                <br />
                <div class="ql-editor" domPropsInnerHTML={detail.content}>
                </div>
                <Divider size='small' />
                <div>
                    {operate.map(ele => {
                        return (
                            <Button type={ele.type as any} on-click={ele.fn}>
                                {ele.text}
                            </Button>
                        );
                    })}
                </div>
            </div>
        );
    }
}
