import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import moment from 'dayjs';

import { myEnum, dev } from '@/config';
import { routerConfig } from '@/router';
import { Tabs, TabPane, Modal, Input, Divider } from '@/components/iview';
import { MyConfirm } from '@/components/my-confirm';
import { convClass } from '@/components/utils';
import { MyList } from '@/components/my-list';

import { UserAvatarView } from '../comps/user-avatar';
import { Base } from '../base';

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
    contentMgtType: number;
    delShow = false;
    delIds = [];
    delRemark = '';
    notPassShow = false;
    notPassRemark = '';
    operateDetail: ContentDataType;
    protected preview = false;

    protected getDefaultDetail<T extends ContentDataType = ContentDataType>() {
        let data = {
            detail: {
                _id: '',
                cover: '',
                coverUrl: '',
                title: '',
                profile: '',
                statusText: '',
                remark: '',
            } as T,
            log: []
        };
        return data;
    }

    protected toggleNotPass(show: boolean) {
        this.notPassShow = show;
        this.notPassRemark = '';
    }

    protected auditSuccessHandler(detail) {

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
        if (detail.user._id === this.storeUser.user._id && detail.status === myEnum.articleStatus.已删除) {
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

    protected delSuccessHandler() { }
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