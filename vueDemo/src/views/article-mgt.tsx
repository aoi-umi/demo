import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import moment from 'moment';
import { testApi } from '@/api';
import { myEnum, authority, dev } from '@/config';
import { Modal, Checkbox, Row, Input } from '@/components/iview';
import { MyList, IMyList, Const as MyTableConst } from '@/components/my-list';
import { MyConfirm } from '@/components/my-confirm';
import { MyImg } from '@/components/my-img';
import { convert } from '@/helpers';
import { DetailDataType } from './article-mgt-detail';
import { Base } from './base';

export class ArticleMgtBase extends Base {
    delShow = false;
    delIds = [];
    notPassShow = false;
    notPassRemark = '';
    operateDetail: DetailDataType;
    protected preview = false;

    protected togglePotPass(show: boolean) {
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
            this.togglePotPass(false);
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

    protected toDetail(_id?, preview?) {
        this.$router.push({
            path: preview ? dev.routeConfig.articleMgtDetail.path : dev.routeConfig.articleMgtEdit.path,
            query: { _id: _id || '' }
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
                    this.togglePotPass(true);
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
                    this.toDetail(detail._id, true);
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
        return operate;
    }

    protected renderNotPassConfirm() {
        return (
            <Modal v-model={this.notPassShow} footer-hide>
                <MyConfirm title='审核不通过' loading={true}
                    cancel={() => {
                        this.togglePotPass(false);
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
                    将要删除{this.delIds.length}项
                    </MyConfirm>
            </Modal>
        );
    }

    protected delSuccessHandler() { }
    async delClick() {
        await this.operateHandler('删除', async () => {
            await testApi.articleMgtDel(this.delIds);
            this.delIds = [];
            this.delShow = false;
            this.delSuccessHandler();
        });
    }
}
@Component
export default class Article extends ArticleMgtBase {
    $refs: { list: IMyList<any> };

    page: any;
    protected created() {
        this.statusList = myEnum.articleStatus.toArray().map(ele => {
            ele['checked'] = false;
            return ele;
        });
        let query = this.$route.query;
        this.page = { index: query.page, size: query.rows };
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
            ele.checked = statusList.includes(ele.value.toString());
        });
        convert.Test.queryToListModel(query, list.model);
        this.$refs.list.query(query);
    }

    statusList: { key: string; value: any, checked?: boolean }[] = [];

    protected delSuccessHandler() {
        this.$refs.list.query();
    }

    protected auditSuccessHandler(detail) {
        this.$refs.list.result.data.splice(detail._index, 1, detail);
    }

    private get multiOperateBtnList() {
        let list = [];
        if (this.storeUser.user.hasAuth(authority.authorityDel)) {
            list.push({
                text: '批量删除',
                onClick: (selection) => {
                    this.delIds = selection.map(ele => ele._id);
                    this.delShow = true;
                }
            });
        }
        return list;
    }

    private getColumns() {
        let columns = [{
            key: '_selection',
            type: 'selection',
            width: 60,
            align: 'center',
            hide: !this.multiOperateBtnList.length
        }, {
            title: '封面',
            key: 'cover',
            minWidth: 120,
            render: (h, params) => {
                return <MyImg class="cover" src={params.row.coverUrl} />;
            }
        }, {
            title: '标题',
            key: 'title',
            minWidth: 120,
        }, {
            title: '简介',
            key: 'profile',
            minWidth: 120,
            ellipsis: true,
            render: (h, params) => {
                return <p style={{ whiteSpace: 'pre-wrap' }}>{params.row.profile}</p>;
            }
        }, {
            title: '用户',
            key: 'user',
            minWidth: 120,
            render: (h, params) => {
                return <p>{params.row.user.nickname}({params.row.user.account})</p>;
            }
        }, {
            title: '状态',
            key: 'statusText',
            minWidth: 80,
        }, {
            title: '创建时间',
            key: 'createdAt',
            minWidth: 90,
            render: (h, params) => {
                return <span>{moment(params.row.createdAt).format(dev.dateFormat)}</span>;
            }
        }, {
            title: '发布时间',
            key: 'publishAt',
            minWidth: 90,
            render: (h, params) => {
                return <span>{moment(params.row.publishAt).format(dev.dateFormat)}</span>;
            }
        }, {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 110,
            render: (h, params) => {
                let detail = params.row;
                let operate = this.getOperate(detail);
                return (
                    <Row class={MyTableConst.clsPrefix + "action-box"}>
                        {operate.map(ele => {
                            return (
                                <div>
                                    <a on-click={ele.fn}>{ele.text}</a>
                                </div>
                            );
                        })}
                    </Row>
                );
            }
        }];
        return columns;
    }

    protected render() {

        return (
            <div>
                {this.renderDelConfirm()}
                {this.renderNotPassConfirm()}
                <MyList
                    ref="list"
                    current={this.page.index}
                    pageSize={this.page.size}
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
                    customQueryNode={this.statusList.map(ele => {
                        return (
                            <label style={{ marginRight: '5px' }}>
                                <Checkbox v-model={ele.checked} />{ele.key}
                            </label>
                        );
                    })}

                    hideQueryBtn={{
                        add: !this.storeUser.user.isLogin
                    }}

                    columns={this.getColumns()}

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
                                status: this.statusList.filter(ele => ele.checked).map(ele => ele.value).join(','),
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