import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Form as IForm } from 'iview';
import moment from 'moment';

import { testApi } from '@/api';
import { myEnum, dev } from '@/config';
import { Modal, Input, Form, FormItem, Button, Checkbox, Switch, Transfer, Divider } from '@/components/iview';
import { routeConfig } from '@/config/config';
import { ArticleBase } from './article';

type DetailDataType = {
    _id: string;
    cover: string;
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
    $refs: { formVaild: IForm };

    created() {
        this.loadDetail();
    }

    async loadDetail() {
        let query = this.$route.query;
        if (query._id) {
            if (query.preview)
                this.preview = true;
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
                    this.$router.push(routeConfig.article);
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
                    `状态: ${detail.statusText}`,
                    `作者: ${detail.user.nickname}(${detail.user.account})`,
                    `创建于: ${moment(detail.createdAt).format(dev.dateFormat)}`,
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
                    <FormItem label="标题" prop="title">
                        <Input v-model={detail.title} />
                    </FormItem>
                    <FormItem label="内容" prop="content">
                        <quill-editor class="article-detail-content-editor" v-model={detail.content} options={{
                            // theme: 'snow',
                            // modules: {
                            //     toolbar: ['bold', 'italic', 'underline', 'strike']
                            // },
                            placeholder: '输点啥。。。',
                        }}></quill-editor>
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
        let operate = this.getOperate(detail, { noPreview: true });
        return (
            <div>
                <h2>{detail.title}</h2>
                <br />
                {this.renderHeader()}
                <br />
                <div domPropsInnerHTML={detail.content}>
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
