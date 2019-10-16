import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import moment from 'dayjs';
import * as iview from 'iview';
import { testApi } from '@/api';

import { myEnum, dev } from '@/config';
import { routerConfig } from '@/router';
import { convClass } from '@/components/utils';
import { Form, FormItem, Button, Modal, Input, Divider, Checkbox, DatePicker } from '@/components/iview';
import { MyConfirm } from '@/components/my-confirm';
import { MyList } from '@/components/my-list';
import { MyUpload, IMyUpload, FileDataType } from '@/components/my-upload';

import { UserAvatarView } from '../comps/user-avatar';
import { Base } from '../base';
import { IMyLoad, MyLoad } from '@/components/my-load';
export class ContentDetailType<T extends ContentDataType = ContentDataType> {
    detail: T;
    log?: any[];
    static create<T extends ContentDataType>(): ContentDetailType<T> {
        let data = {
            detail: {
                _id: '',
                cover: '',
                coverUrl: '',
                title: '',
                profile: '',
                statusText: '',
                remark: '',
            } as any as T,
            log: []
        };
        return data;
    }
}

export type ContentDataType = {
    _id: string;
    cover: string;
    coverUrl: string;
    title: string;
    profile: string;
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
    userId: string;

    voteValue: number;
    canUpdate: boolean;
    canDel: boolean;
    user: { _id: string; nickname: string; account: string };

    _disabled?: boolean;
    _checked?: boolean;
};

export abstract class ContentMgtBase extends Base {
    abstract contentMgtType: string;
    delShow = false;
    delIds = [];
    delRemark = '';
    notPassShow = false;
    notPassRemark = '';
    operateDetail: ContentDataType;
    protected preview = false;

    protected getDefaultDetail<T extends ContentDataType = ContentDataType>() {
        let data = ContentDetailType.create<T>();
        return data;
    }

    protected toggleNotPass(show: boolean) {
        this.notPassShow = show;
        this.notPassRemark = '';
    }

    protected auditSuccessHandler(detail) {
        this.toList();
    }

    protected abstract auditFn(detail: ContentDataType, pass: boolean): Promise<{ status, statusText }>;

    protected async audit(detail: ContentDataType, pass: boolean) {
        await this.operateHandler('审核', async () => {
            let rs = await this.auditFn(detail, pass);
            detail.status = rs.status;
            detail.statusText = rs.statusText;
            this.auditSuccessHandler(detail);
            this.toggleNotPass(false);
        });
    }

    protected abstract canAudit(detail: ContentDataType): boolean;

    protected toList() {
        console.log(this.contentMgtType);
        this.$router.push({
            path: routerConfig.contentMgt.path,
            query: {
                tab: this.contentMgtType as any
            }
        });
    }

    abstract toDetailUrl(preview: boolean): string;

    protected toDetail(_id?, opt?: {
        preview?: boolean,
        repost?: boolean,
    }) {
        opt = {
            ...opt
        };
        this.$router.push({
            path: this.toDetailUrl(opt.preview),
            query: { _id: _id || '', repost: opt.repost ? 'true' : '' }
        });
    }

    protected abstract isDel(detail: ContentDataType): boolean;

    protected getOperate(detail: ContentDataType, opt?: { noPreview?: boolean; isDetail?: boolean; }) {
        opt = { ...opt };
        let operate: { text: string, type?: string, fn: () => any }[] = [];
        if (this.canAudit(detail)) {
            operate = [...operate, {
                text: '审核通过',
                type: 'primary',
                fn: () => {
                    this.audit(detail, true);
                }
            }, {
                text: '审核不通过',
                fn: () => {
                    this.operateDetail = detail;
                    this.toggleNotPass(true);
                }
            },];
        }
        if (detail.canUpdate) {
            operate.push({
                text: '修改',
                fn: () => {
                    if (opt.isDetail)
                        this.preview = false;
                    else
                        this.toDetail(detail._id);
                }
            });
        }
        if (!opt.noPreview) {
            operate.push({
                text: '预览',
                fn: () => {
                    this.toDetail(detail._id, { preview: true });
                }
            });
        }
        if (detail.canDel) {
            operate.push({
                text: '删除',
                fn: () => {
                    this.delIds = [detail._id];
                    this.delShow = true;
                }
            });
        }
        if (detail.user._id === this.storeUser.user._id && this.isDel(detail)) {
            operate.push({
                text: '重投',
                fn: () => {
                    this.toDetail(detail._id, { repost: true });
                }
            });
        }
        return operate;
    }

    protected renderNotPassConfirm() {
        return (
            <Modal v-model={this.notPassShow} footer-hide>
                <MyConfirm title='审核不通过' loading={true}
                    cancel={() => {
                        this.toggleNotPass(false);
                    }}
                    ok={() => {
                        return this.audit(this.operateDetail, false);
                    }}>
                    备注: <Input v-model={this.notPassRemark} />
                </MyConfirm>
            </Modal>
        );
    }

    protected renderDelConfirm() {
        return (
            <Modal v-model={this.delShow} footer-hide>
                <MyConfirm title='确认删除?' loading={true}
                    cancel={() => {
                        this.delShow = false;
                    }}
                    ok={async () => {
                        await this.delClick();
                    }}>
                    <p>将要删除{this.delIds.length}项</p>
                    <p>备注: <Input v-model={this.delRemark} /></p>
                </MyConfirm>
            </Modal>
        );
    }

    protected delSuccessHandler() {
        this.toList();
    }
    protected abstract delFn(): Promise<any>;
    async delClick() {
        await this.operateHandler('删除', async () => {
            await this.delFn();
            this.delIds = [];
            this.delShow = false;
            this.delRemark = '';
            this.delSuccessHandler();
        });
    }
}

@Component
export class ContentMgtDetail extends Base {
    @Prop({
        required: true
    })
    loadDetailData: () => Promise<ContentDetailType>;

    @Prop()
    getRules: () => any;

    @Prop()
    beforeValidFn: (detail) => Promise<any>;

    @Prop({
        required: true
    })
    saveFn: (detail, submit: boolean) => Promise<any>;

    @Prop({
        required: true
    })
    saveSuccessFn: (rs) => void;

    @Prop()
    preview: boolean;

    @Prop({
        required: true
    })
    renderPreviewFn: (detail) => any;

    $refs: { formVaild: iview.Form, cover: IMyUpload, loadView: IMyLoad };

    mounted() {
        this.init();
    }

    @Watch('$route')
    route(to, from) {
        this.init();
    }

    private init() {
        this.$refs.loadView.loadData();
    }

    innerDetail: ContentDetailType = null;

    rules = {};
    private getCommonRules() {
        return {
            title: [
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
        };
    }

    private setRules() {
        let rule = this.getRules ? this.getRules() : {};
        this.rules = {
            ...this.getCommonRules(),
            ...rule,
        };
    }

    private coverList = [];
    private async loadDetail() {
        let detail: ContentDetailType;
        detail = await this.loadDetailData();
        this.coverList = detail.detail.coverUrl ? [{ url: detail.detail.coverUrl, fileType: FileDataType.图片 }] : [];
        this.innerDetail = detail;
        this.setRules();
        return detail;
    }

    private saving = false;
    private async handleSave(submit?: boolean) {
        this.saving = true;
        let { detail } = this.innerDetail;
        let rs;
        await this.operateHandler('保存', async () => {
            rs = await this.saveFn(detail, submit);
        }, {
            validate: this.$refs.formVaild.validate,
            beforeValid: async () => {
                let upload = this.$refs.cover;
                let err = await upload.upload();
                if (err.length) {
                    throw new Error('上传封面出错:' + err.join(','));
                }
                let file = upload.fileList[0];
                if (!file)
                    detail.cover = '';
                else if (file.uploadRes)
                    detail.cover = file.uploadRes;
                this.beforeValidFn && await this.beforeValidFn(detail);
            },
            onSuccessClose: () => {
                this.saveSuccessFn(rs);
            }
        }).finally(() => {
            this.saving = false;
        });
    }

    protected render() {
        return (
            <MyLoad
                ref="loadView"
                loadFn={this.loadDetail}
                renderFn={() => {
                    if (!this.preview)
                        return this.renderEdit();
                    return this.renderPreviewFn(this.innerDetail);
                }}
            />
        );
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

    protected renderEdit() {
        let { detail } = this.innerDetail;
        return (
            <div>
                <h3>{detail._id ? '修改' : '新增'}</h3>
                <Form ref="formVaild" label-position="top" props={{ model: detail }} rules={this.rules}>
                    <FormItem label="" prop="header" v-show={!detail._id}>
                        {!!detail._id && this.renderHeader(detail)}
                    </FormItem>
                    <FormItem label="封面" prop="cover">
                        <MyUpload
                            ref='cover'
                            headers={testApi.defaultHeaders}
                            uploadUrl={testApi.imgUploadUrl}
                            successHandler={(res, file) => {
                                let rs = testApi.uplodaHandler(res);
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
                    {this.$slots.default}
                    <FormItem prop="setPublishAt">
                        <label style={{ marginRight: '5px' }}>
                            <Checkbox v-model={detail.setPublish} />
                            指定时间发布
                        </label>
                        <DatePicker v-model={detail.setPublishAt} type="datetime" options={{
                            disabledDate: (date?: Date) => {
                                let start = moment().startOf('day');
                                let end = moment(start).add(3, 'd');
                                return date && (date.valueOf() < start.valueOf() || date.valueOf() >= end.valueOf());
                            }
                        }} />
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
}

export const ContentMgtDetailView = convClass<ContentMgtDetail>(ContentMgtDetail)


@Component
export class ContentLogList extends Base {
    @Prop({
        default: () => []
    })
    log: any[];

    render() {
        let log = this.log;
        return (
            <div>
                {log.length > 0 &&
                    <div>
                        <Divider size='small' />
                        <MyList
                            hideSearchBox
                            hidePage
                            columns={[{
                                title: '操作人',
                                key: 'user',
                                render: (h, params) => {
                                    return <UserAvatarView style={{ margin: '5px' }} user={params.row.user} />;
                                }
                            }, {
                                title: '源状态',
                                key: 'srcStatusText',
                            }, {
                                title: '目状态',
                                key: 'destStatusText',
                            }, {
                                title: '备注',
                                key: 'remark',
                            }, {
                                title: '操作时间',
                                key: 'createdAt',
                                render: (h, params) => {
                                    return <span>{moment(params.row.createdAt).format(dev.dateFormat)}</span>
                                }
                            }]}
                            data={log}>
                        </MyList>
                    </div>
                }
            </div>
        );
    }
}

export const ContentLogListView = convClass<ContentLogList>(ContentLogList)