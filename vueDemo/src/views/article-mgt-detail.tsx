import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Form as IForm } from 'iview';
import moment from 'moment';

import { testApi } from '@/api';
import { myEnum, dev } from '@/config';
import { Input, Form, FormItem, Button, Divider, Table, Checkbox, DatePicker } from '@/components/iview';
import { MyUpload, IMyUpload } from '@/components/my-upload';
import { ArticleMgtBase } from './article-mgt';
import { MyEditor } from '@/components/my-editor';
import { IMyEditor } from '@/components/my-editor/my-editor';
import { UserAvatarView } from './user-avatar';
import { LoadView, ILoadView } from './load-view';

export type DetailType = {
    detail: DetailDataType;
    log?: any[];
}
export type DetailDataType = {
    _id: string;
    cover: string;
    coverUrl: string;
    title: string;
    profile: string;
    content: string;
    status: number;
    statusText: string;
    createdAt: string;
    remark: string;
    readTimes: number;
    commentCount: number;
    like: number;
    dislike: number;

    setPublish: boolean;
    setPublishAt: string;
    publishAt: string;

    voteValue: number;
    canUpdate: boolean;
    canDel: boolean;
    user: { _id: string; nickname: string; account: string };
};
@Component
export default class ArticleDetail extends ArticleMgtBase {
    private getDetailData() {
        let data = {
            detail: {
                _id: '',
                cover: '',
                coverUrl: '',
                title: '',
                profile: '',
                content: '',
                status: myEnum.articleStatus.草稿,
                statusText: '',
                remark: '',
            },
            log: []
        };
        data.detail.statusText = myEnum.articleStatus.getKey(data.detail.status);
        return data;
    }

    private innerDetail: DetailType = null;

    private rules = {};

    private setRules() {
        this.rules = {
            title: [
                { required: true, trigger: 'blur' }
            ],
            content: [
                { required: true, trigger: 'blur' }
            ],
            setPublishAt: [{
                validator: (rule, value, callback) => {
                    let { detail } = this.innerDetail;
                    if (detail.setPublish && !detail.setPublishAt) {
                        callback(new Error('请填写发布时间'));
                    } else {
                        callback();
                    }
                },
                trigger: 'blur'
            }],
        }
    }

    $refs: { formVaild: IForm, editor: IMyEditor, upload: IMyUpload, loadView: ILoadView };

    mounted() {
        this.$refs.loadView.loadData();
    }

    coverList = [];
    async loadDetail() {
        let query = this.$route.query;
        let detail: DetailType;
        if (query._id) {
            this.preview = this.$route.path == dev.routeConfig.articleMgtDetail.path;
            detail = await testApi.articleMgtDetailQuery({ _id: query._id });
        } else {
            detail = this.getDetailData() as any;
        }
        this.coverList = detail.detail.coverUrl ? [{ url: detail.detail.coverUrl }] : [];
        this.innerDetail = detail;
        this.setRules();
        return detail;
    }


    saving = false;
    async handleSave(submit?: boolean) {
        this.saving = true;
        let { detail } = this.innerDetail;
        await this.operateHandler('保存', async () => {
            let upload = this.$refs.upload;
            let err = await upload.upload();
            if (err.length) {
                throw new Error(err.join(','));
            }
            let file = upload.fileList[0];
            if (!file)
                detail.cover = '';
            else if (file.uploadRes)
                detail.cover = file.uploadRes;
            let { user, ...restDetail } = detail;
            let rs = await testApi.articleMgtSave({
                ...restDetail,
                submit
            });
        }, {
                validate: this.$refs.formVaild.validate,
                onSuccessClose: () => {
                    this.toList();
                }
            }
        ).finally(() => {
            this.saving = false;
        });
    }

    auditSuccessHandler() {
        this.toList();
    }

    delSuccessHandler() {
        this.toList();
    }

    render() {
        return (
            <LoadView
                ref="loadView"
                loadFn={this.loadDetail}
                renderFn={() => {
                    if (!this.preview)
                        return this.renderEdit();
                    return this.renderPreview();
                }}
            />
        );
    }

    renderHeader(detail: DetailDataType) {
        return (
            <div>
                <UserAvatarView user={detail.user} tipsPlacement="top-start" />
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

    renderLog() {
        let { log } = this.innerDetail;
        return (
            <div>
                {log.length > 0 &&
                    <div>
                        <Divider size='small' />
                        <Table
                            columns={[{
                                title: '源状态',
                                key: 'srcStatusText',
                            }, {
                                title: '目状态',
                                key: 'destStatusText',
                            }, {
                                title: '备注',
                                key: 'remark',
                            }, {
                                title: '操作人',
                                key: 'user',
                            }, {
                                title: '操作时间',
                                key: 'createdAt',
                                render: (h, params) => {
                                    return <span>{moment(params.row.createdAt).format(dev.dateFormat)}</span>
                                }
                            }]}
                            data={log}>
                        </Table>
                    </div>
                }
            </div>
        );
    }

    renderEdit() {
        let self = this;
        let { detail } = this.innerDetail;
        return (
            <div>
                <h3>{detail._id ? '修改' : '新增'}</h3>
                <Form label-width={90} ref="formVaild" props={{ model: detail }} rules={this.rules}>
                    <FormItem label="" prop="header" v-show={!detail._id}>
                        {!!detail._id && this.renderHeader(detail)}
                    </FormItem>
                    <FormItem label="封面" prop="cover">
                        <MyUpload
                            ref='upload'
                            headers={testApi.defaultHeaders}
                            uploadUrl={testApi.imgUploadUrl}
                            successHandler={(res, file) => {
                                let rs = testApi.imgUplodaHandler(res);
                                file.url = rs.url;
                                return rs.fileId;
                            }}
                            format={['jpg', 'png', 'bmp', 'gif']}
                            width={160} height={90}
                            v-model={this.coverList}
                        />
                    </FormItem>
                    <FormItem label="标题" prop="title">
                        <Input v-model={detail.title} />
                    </FormItem>
                    <FormItem label="简介" prop="profile">
                        <Input v-model={detail.profile} type="textarea" />
                    </FormItem>
                    <FormItem label="内容" prop="content">
                        <MyEditor ref="editor" class="article-mgt-detail-content"
                            v-model={detail.content}
                            placeholder='输点啥。。。'
                            img-change={(file => {
                                testApi.imgUpload(file).then(t => {
                                    this.$refs.editor.insertEmbed('image', t.url);
                                }).catch(e => {
                                    self.$Notice.error({
                                        title: '上传出错',
                                        desc: e,
                                    });
                                });
                            })} />
                    </FormItem>
                    <FormItem label="指定时间发布" prop="setPublishAt">
                        <Checkbox v-model={detail.setPublish} />
                        <DatePicker v-model={detail.setPublishAt} type="datetime" />
                    </FormItem>
                    <FormItem label="备注" prop="remark">
                        <Input v-model={detail.remark} />
                    </FormItem>
                    {(!detail._id || detail.canUpdate) &&
                        <div>
                            <Divider size='small' />
                            <FormItem>
                                <Button on-click={() => {
                                    this.handleSave(false);
                                }} loading={this.saving}>保存草稿</Button>
                                <Button type="primary" on-click={() => {
                                    this.handleSave(true);
                                }} loading={this.saving}>发布</Button>
                            </FormItem>
                        </div>
                    }
                </Form>
                {this.renderLog()}
            </div >
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
}
