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

type DetailDataType = {
    _id?: string;
    cover?: string;
    title?: string;
    content?: string;
    status?: number;
    statusText?: string;
}
@Component
class ArticleDetail extends Vue {
    @Prop()
    detail: any;

    @Watch('detail')
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

    saving = false;
    async save() {
        this.saving = true;
        let detail = this.innerDetail;
        try {
            let rs = await testApi.articleSave({
                _id: detail._id,
                title: detail.title,
                content: detail.content,
            });
            this.$emit('save-success', rs);
            this.initDetail(this.getDetailData());
        } catch (e) {
            this.$Message.error('出错了:' + e.message);
        } finally {
            this.saving = false;
        }
    }

    render() {
        let detail = this.innerDetail;
        return (
            <div>
                <h3>{detail._id ? '修改' : '新增'}</h3>
                <br />
                <Form label-width={50} ref="formVaild" props={{ model: detail }} rules={this.rules}>
                    <FormItem label="状态" prop="status">
                        {detail.statusText}
                    </FormItem>
                    <FormItem label="标题" prop="title">
                        <Input v-model={detail.title} />
                    </FormItem>
                    <FormItem label="内容" prop="content">
                        <Input v-model={detail.content} />
                    </FormItem>
                    <FormItem>
                        <Button type="primary" on-click={() => {
                            this.$refs.formVaild.validate((valid) => {
                                if (!valid) {
                                    this.$Message.error('参数有误');
                                } else {
                                    this.save();
                                }
                            });
                        }} loading={this.saving}>保存</Button>
                    </FormItem>
                </Form>
            </div >
        );
    }
}

const ArticleDetailView = convClass<ArticleDetail>(ArticleDetail);

@Component
export default class Article extends Vue {
    detailShow = false;
    delShow = false;
    detail: any;
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
        ['name', 'code', 'anyKey'].forEach(key => {
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
    private async audit(detail: DetailDataType, pass: boolean) {
        try {
            let toStatus = pass ? myEnum.articleStatus.审核通过 : myEnum.articleStatus.审核不通过;
            await testApi.articleMgtAudit({ idList: [detail._id], status: toStatus });
            detail.status = toStatus;
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
            title: '名字',
            key: 'name',
            sortable: 'custom' as any,
            minWidth: 120,
        }, {
            title: '编码',
            key: 'code',
            sortable: 'custom' as any,
            minWidth: 120,
        }, {
            title: '状态',
            key: 'status',
            minWidth: 80,
            render: (h, params) => {
                let text = myEnum.authorityStatus.getKey(params.row.status);
                return <span>{text}</span>;
            }
        }, {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 150,
            hide: !this.storeUser.user.existsAuth([authority.authoritySave, authority.authorityDel]),
            render: (h, params) => {
                let detail = params.row;
                return (
                    <div class={MyTableConst.clsPrefix + "action-box"}>
                        {this.storeUser.user.hasAuth(authority.authoritySave) && [
                            <a on-click={() => {
                                this.audit(detail, true);
                            }}>{detail.status == myEnum.authorityStatus.启用 ? '禁用' : '启用'}</a>,
                            <a on-click={() => {
                                this.detail = detail;
                                this.detailShow = true;
                            }}>编辑</a>
                        ]}
                        {this.storeUser.user.hasAuth(authority.authorityDel) &&
                            <a on-click={() => {
                                this.delIds = [detail._id];
                                this.delShow = true;
                            }}>删除</a>
                        }
                    </div>
                );
            }
        }];
        return columns;
    }

    protected render() {

        return (
            <div>
                <Modal v-model={this.detailShow} footer-hide mask-closable={false}>
                    <ArticleDetailView detail={this.detail} on-save-success={() => {
                        this.detailShow = false;
                        this.$refs.list.query();
                    }} />
                </Modal>
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
                        account: {
                            label: '用户账号',
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
                        add: true
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
                        this.detail = null;
                        this.detailShow = true;
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