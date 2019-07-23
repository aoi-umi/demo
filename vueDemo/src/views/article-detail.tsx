import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Form as IForm } from 'iview';
import { getModule } from 'vuex-module-decorators';
import { testApi } from '@/api';
import { myEnum, authority } from '@/config';
import { Modal, Input, Form, FormItem, Button, Checkbox, Switch, Transfer } from '@/components/iview';
import { MyList, IMyList, Const as MyTableConst } from '@/components/my-list';
import { MyConfirm } from '@/components/my-confirm';
import { convClass, convert } from '@/helpers';
import LoginUserStore from '@/store/loginUser';
import { routeConfig } from '@/config/config';

type DetailDataType = {
    _id?: string;
    cover?: string;
    title?: string;
    content?: string;
    status?: number;
    statusText?: string;
    canUpdate?: boolean;
};
@Component
export default class ArticleDetail extends Vue {

    updateDetail(newVal) {
        let data = newVal || this.getDetailData();
        this.initDetail(data);
    }
    private innerDetail: DetailDataType = {};
    private getDetailData() {
        return {
            _id: '',
            name: '',
            code: '',
            status: myEnum.articleStatus.草稿
        };
    }

    private initDetail(data) {
        this.innerDetail = data;
    }

    private rules = {
        name: [
            { required: true, trigger: 'blur' }
        ],
        code: [
            { required: true, trigger: 'blur' }
        ],
    };
    $refs: { formVaild: IForm };

    mounted() {
        this.loadDetail();
    }

    async loadDetail() {
        let query = this.$route.query;
        if (query._id) {
            try {
                let rs = await testApi.articleDetailQuery({ _id: query._id });
                this.updateDetail(rs);
            } catch (e) {
                this.$Message.error(e.message);
            }
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
        let detail = this.innerDetail;
        return (
            <div>
                <h3>{detail._id ? '修改' : '新增'}</h3>
                <br />
                <Form label-width={50} ref="formVaild" props={{ model: detail }} rules={this.rules}>
                    {detail._id &&
                        <FormItem label="状态" prop="status">
                            {detail.statusText}
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
                    <FormItem>
                        <Button type="primary" on-click={() => {
                            this.saveClickHandler(false);
                        }} loading={this.saving}>保存草稿</Button>
                        <Button type="primary" on-click={() => {
                            this.saveClickHandler(true);
                        }} loading={this.saving}>发布</Button>
                    </FormItem>
                </Form>
            </div >
        );
    }
}
