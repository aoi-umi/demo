import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import moment from 'moment';
import { testApi } from '@/api';
import { myEnum, authority, dev } from '@/config';
import { routeConfig } from '@/config/config';
import { Modal, Input, Form, FormItem, Button, Checkbox, Switch, Row, Col } from '@/components/iview';
import { MyList, IMyList, Const as MyTableConst } from '@/components/my-list';
import { MyConfirm } from '@/components/my-confirm';
import { convClass, convert } from '@/helpers';
import LoginUserStore from '@/store/loginUser';

@Component
export default class Article extends Vue {
    delShow = false;
    $refs: { list: IMyList<any> };
    get storeUser() {
        return getModule(LoginUserStore, this.$store);
    }

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
        ['user', 'title', 'anyKey'].forEach(key => {
            if (query[key])
                this.$set(list.model.query, key, query[key]);
        });
        let status = this.$route.query.status as string;
        let statusList = status ? status.split(',') : [];
        this.statusList.forEach(ele => {
            ele.checked = statusList.includes(ele.value.toString());
        });
        convert.Test.queryToListModel(query, list.model);
        this.$refs.list.query(query);
    }

    delIds = [];
    statusList: { key: string; value: any, checked?: boolean }[] = [];
    async delClick() {
        try {
            await testApi.articleDel(this.delIds);
            this.$Message.info('删除成功');
            this.delIds = [];
            this.delShow = false;
            this.$refs.list.query();
        } catch (e) {
            this.$Message.error('删除失败:' + e.message);
        }
    }
    private async audit(detail: { _id: string, status, statusText }, pass: boolean) {
        try {
            let toStatus = pass ? myEnum.articleStatus.审核通过 : myEnum.articleStatus.审核不通过;
            let rs = await testApi.articleMgtAudit({ idList: [detail._id], status: toStatus });
            detail.status = rs.status;
            detail.statusText = rs.statusText;
            this.$Message.info('审核成功');
        } catch (e) {
            this.$Message.error('审核失败:' + e.message);
        }
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
            title: '标题',
            key: 'title',
            minWidth: 120,
        }, {
            title: '内容',
            key: 'content',
            minWidth: 120,
            ellipsis: true,
            render: (h, params) => {
                return <p v-html={params.row.content}></p>;
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
            key: 'status',
            minWidth: 80,
            render: (h, params) => {
                let text = myEnum.articleStatus.getKey(params.row.status);
                return <span>{text}</span>;
            }
        }, {
            title: '创建时间',
            key: 'createdAt',
            minWidth: 90,
            render: (h, params) => {
                return <span>{moment(params.row.createdAt).format(dev.dateFormat)}</span>;
            }
        }, {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 180,
            hide: !this.storeUser.user.existsAuth([authority.articleMgtAudit, authority.articleMgtDel]),
            render: (h, params) => {
                let detail = params.row;
                return (
                    <Row class={MyTableConst.clsPrefix + "action-box"}>
                        {this.storeUser.user.hasAuth(authority.articleMgtAudit) && [
                            <Col xs={10}>
                                <a on-click={() => {
                                    this.audit(detail, true);
                                }}>审核通过</a>
                            </Col>,
                            <Col xs={10}>
                                <a on-click={() => {
                                    this.audit(detail, false);
                                }}>审核不通过</a>
                            </Col>,
                        ]}
                        {this.storeUser.user._id === detail.userId && detail.canUpdate && [
                            <Col xs={10}>
                                <a on-click={() => {
                                    this.toDetail(detail._id);
                                }}>编辑</a>
                            </Col>,
                        ]}
                        {(this.storeUser.user._id === detail.userId || this.storeUser.user.hasAuth(authority.articleMgtDel)) && [
                            <Col xs={10}>
                                <a on-click={() => {
                                    this.delIds = [detail._id];
                                    this.delShow = true;
                                }}>删除</a>
                            </Col>
                        ]}
                    </Row>
                );
            }
        }];
        return columns;
    }

    private toDetail(_id?) {
        this.$router.push({
            path: routeConfig.articleDetail.path,
            query: { _id: _id || '' }
        });
    }

    protected render() {

        return (
            <div>
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
                        // add: true
                    }}

                    columns={this.getColumns()}

                    queryFn={async (data) => {
                        let rs = await testApi.articleQuery(data);
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