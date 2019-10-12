import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { testApi } from '@/api';
import { myEnum, authority, dev } from '@/config';
import { convert } from '@/helpers';
import { Modal, Checkbox, Row, Input, Card, Button } from '@/components/iview';
import { MyList, IMyList } from '@/components/my-list';
import { MyConfirm } from '@/components/my-confirm';
import { MyTag, TagType } from '@/components/my-tag';
import { DetailDataType } from './article-mgt-detail';
import { Base } from './base';
import { ArticleListItemView } from './article';

export class ArticleMgtBase extends Base {
    delShow = false;
    delIds = [];
    delRemark = '';
    notPassShow = false;
    notPassRemark = '';
    operateDetail: DetailDataType;
    protected preview = false;

    protected toggleNotPass(show: boolean) {
        this.notPassShow = show;
        this.notPassRemark = '';
    }

    protected auditSuccessHandler(detail) {

    }

    protected async audit(detail: { _id: string, status, statusText }, pass: boolean) {
        await this.operateHandler('审核', async () => {
            let toStatus = pass ? myEnum.articleStatus.审核通过 : myEnum.articleStatus.审核不通过;
            let rs = await testApi.articleMgtAudit({ idList: [detail._id], status: toStatus, remark: this.notPassRemark });
            detail.status = rs.status;
            detail.statusText = rs.statusText;
            this.auditSuccessHandler(detail);
            this.toggleNotPass(false);
        });
    }

    protected canAudit(detail: { status?: number }) {
        return detail.status == myEnum.articleStatus.待审核 && this.storeUser.user.hasAuth(authority.articleMgtAudit)
    }

    protected toList() {
        this.$router.push({
            path: dev.routeConfig.articleMgt.path,
        });
    }

    protected toDetail(_id?, opt?: {
        preview?: boolean,
        repost?: boolean,
    }) {
        opt = {
            ...opt
        };
        this.$router.push({
            path: opt.preview ? dev.routeConfig.articleMgtDetail.path : dev.routeConfig.articleMgtEdit.path,
            query: { _id: _id || '', repost: opt.repost ? 'true' : '' }
        });
    }

    protected getOperate(detail: DetailDataType, opt?: { noPreview?: boolean; isDetail?: boolean; }) {
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
    async delClick() {
        await this.operateHandler('删除', async () => {
            await testApi.articleMgtDel({ idList: this.delIds, remark: this.delRemark });
            this.delIds = [];
            this.delShow = false;
            this.delRemark = '';
            this.delSuccessHandler();
        });
    }
}
@Component
export default class Article extends ArticleMgtBase {
    $refs: { list: IMyList<any> };

    protected created() {
        this.statusList = myEnum.articleStatus.toArray().map(ele => {
            return {
                tag: ele.key,
                key: ele.value,
                checkable: true
            }
        });
    }

    mounted() {
        this.query();
    }

    @Watch('$route')
    route(to, from) {
        this.query();
    }

    query() {
        let list = this.$refs.list;
        let query = this.$route.query;
        list.setQueryByKey(query, ['user', 'title', 'anyKey']);
        let status = this.$route.query.status as string;
        let statusList = status ? status.split(',') : [];
        this.statusList.forEach(ele => {
            ele.checked = statusList.includes(ele.key.toString());
        });
        convert.Test.queryToListModel(query, list.model);
        this.$refs.list.query(query);
    }

    statusList: TagType[] = [];

    protected delSuccessHandler() {
        this.query();
    }

    protected auditSuccessHandler(detail) {
        let data = this.$refs.list.result.data;
        let idx = data.findIndex(ele => ele._id === detail._id);
        this.$refs.list.result.data.splice(idx, 1, detail);
    }

    private get multiOperateBtnList() {
        let list = [];
        if (this.storeUser.user.hasAuth(authority.authorityDel)) {
            list.push({
                text: '批量删除',
                onClick: (selection) => {
                    this.delIds = selection.map(ele => ele._id);
                    this.delShow = true;
                    this.delRemark = '';
                }
            });
        }
        return list;
    }

    protected render() {

        return (
            <div>
                {this.renderDelConfirm()}
                {this.renderNotPassConfirm()}
                <MyList
                    ref="list"
                    queryArgs={{
                        user: {
                            label: '用户',
                        },
                        title: {
                            label: '标题',
                        },
                        anyKey: {
                            label: '任意字'
                        }
                    }}
                    customQueryNode={<MyTag v-model={this.statusList} />}

                    hideQueryBtn={{
                        add: !this.storeUser.user.isLogin
                    }}

                    type="custom"
                    customRenderFn={(rs) => {
                        if (!rs.success || !rs.data.length) {
                            let msg = !rs.success ? rs.msg : '暂无数据';
                            return (
                                <Card style={{ marginTop: '5px', textAlign: 'center' }}>{msg}</Card>
                            );
                        }
                        return rs.data.map((ele: DetailDataType) => {
                            ele._disabled = !ele.canDel;
                            return (
                                <ArticleListItemView value={ele} mgt
                                    selectable={!!this.multiOperateBtnList.length}
                                    on-selected-change={(val) => {
                                        ele._checked = val;
                                        this.$refs.list.selectedRows = rs.data.filter(ele => ele._checked);
                                    }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        {
                                            this.getOperate(ele).map(ele => {
                                                return (
                                                    <Button type={ele.type as any} on-click={ele.fn}>
                                                        {ele.text}
                                                    </Button>
                                                );
                                            })
                                        }
                                    </div>
                                </ArticleListItemView>
                            );
                        });
                    }}

                    queryFn={async (data) => {
                        let rs = await testApi.articleMgtQuery(data);
                        return rs;
                    }}

                    on-query={(model) => {
                        let q = { ...model.query };
                        this.$router.push({
                            path: this.$route.path,
                            query: {
                                ...q,
                                status: this.statusList.filter(ele => ele.checked).map(ele => ele.key).join(','),
                                ...convert.Test.listModelToQuery(model),
                            }
                        });
                    }}

                    on-add-click={() => {
                        this.toDetail();
                    }}

                    on-reset-click={() => {
                        this.statusList.forEach(ele => {
                            ele.checked = false;
                        });
                    }}

                    multiOperateBtnList={this.multiOperateBtnList}
                >
                </MyList>
            </div>
        );
    }
}