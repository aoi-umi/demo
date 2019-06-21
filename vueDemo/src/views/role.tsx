import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Form as IForm } from 'iview';
import { getModule } from 'vuex-module-decorators';
import { testApi } from '@/api';
import { myEnum, authority } from '@/config';
import { convClass } from '@/helpers';
import { Modal, Input, Form, FormItem, Button, Checkbox, Switch } from '@/components/iview';
import { MyList, IMyList, Const as MyTableConst } from '@/components/my-list';
import { MyConfirm } from '@/components/my-confirm';
import { MyTagModel } from '@/components/my-tag';
import { IMyTransfer, MyTransfer } from '@/components/my-transfer';

import LoginUserStore from '@/store/loginUser';

import { AuthorityTransferView, IAuthorityTransfer } from './authority';

type DetailDataType = {
    _id?: string;
    name?: string;
    code?: string;
    status?: number;
    authorityList?: { code: string; name: string, isDel: boolean; }[];
    isDel?: boolean;
}
@Component
class RoleDetail extends Vue {
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
            status: myEnum.roleStatus.启用,
            authorityList: []
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
    $refs: { formVaild: IForm, authTransfer: IAuthorityTransfer };

    private saving = false;
    private async save() {
        this.saving = true;
        let detail = this.innerDetail;
        try {
            let { addList, delList } = this.$refs.authTransfer.getChangeData('key');
            let rs = await testApi.roleSave({
                _id: detail._id,
                name: detail.name,
                code: detail.code,
                status: detail.status,
                addAuthList: addList,
                delAuthList: delList,
            });
            this.$emit('save-success', rs);
            this.initDetail(this.getDetailData());
        } catch (e) {
            this.$Message.error('出错了:' + e.message);
        } finally {
            this.saving = false;
        }
    }

    protected render() {
        let detail = this.innerDetail;
        return (
            <div>
                <h3>{detail._id ? '修改' : '新增'}</h3>
                <br />
                <Form label-width={50} ref="formVaild" props={{ model: detail }} rules={this.rules}>
                    <FormItem label="状态" prop="status">
                        <Switch v-model={detail.status} true-value={myEnum.roleStatus.启用} false-value={myEnum.roleStatus.禁用} />
                    </FormItem>
                    <FormItem label="名字" prop="name">
                        <Input v-model={detail.name} />
                    </FormItem>
                    <FormItem label="编码" prop="code">
                        <Input v-model={detail.code} />
                    </FormItem>
                    <FormItem label="权限">
                        <AuthorityTransferView ref="authTransfer" selectedData={detail.authorityList} />
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

const RoleDetailView = convClass<RoleDetail>(RoleDetail);

@Component
export default class Role extends Vue {
    detailShow = false;
    delShow = false;
    detail: any;
    $refs: { table: IMyList<any> };
    get storeUser() {
        return getModule(LoginUserStore, this.$store);
    }

    page: any;
    protected created() {
        this.statusList = myEnum.roleStatus.toArray().map(ele => {
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
        let table = this.$refs.table;
        let query = this.$route.query;
        ['name', 'code', 'anyKey'].forEach(key => {
            if (query[key])
                this.$set(table.model.query, key, query[key]);
        });
        let status = query.status as string;
        let statusList = status ? status.split(',') : [];
        this.statusList.forEach(ele => {
            ele.checked = statusList.includes(ele.value.toString());
        });
        table.model.setPage({ index: query.page, size: query.rows });
        this.$refs.table.query(query);
    }

    delIds = [];
    statusList: { key: string; value: any, checked?: boolean }[] = [];
    async delClick() {
        try {
            await testApi.roleDel(this.delIds);
            this.$Message.info('删除成功');
            this.delIds = [];
            this.delShow = false;
            this.$refs.table.query();
        } catch (e) {
            this.$Message.error('删除失败:' + e.message);
        }
    }
    private async updateStatus(detail: DetailDataType) {
        try {
            let toStatus = detail.status == myEnum.roleStatus.启用 ? myEnum.roleStatus.禁用 : myEnum.roleStatus.启用;
            await testApi.roleUpdate({ _id: detail._id, status: toStatus });
            detail.status = toStatus;
            this.$Message.info('修改成功');
        } catch (e) {
            this.$Message.error('修改失败:' + e.message);
        }
    }
    
    private get multiOperateBtnList() {
        let list = [];
        if (this.storeUser.user.hasAuth(authority.roleDel)) {
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
            key: '_expand',
            type: 'expand',
            width: 30,
            render: (h, params) => {
                let authorityList = params.row.authorityList;
                return MyTagModel.renderAuthorityTag(authorityList);
            }
        }, {
            title: '名字',
            key: 'name',
            minWidth: 120,
        }, {
            title: '编码',
            key: 'code',
            minWidth: 120,
        }, {
            title: '状态',
            key: 'status',
            minWidth: 80,
            render: (h, params) => {
                let text = myEnum.roleStatus.getKey(params.row.status);
                return <span>{text}</span>;
            }
        }, {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 150,
            hide: !this.storeUser.user.existsAuth([authority.roleSave, authority.roleDel]),
            render: (h, params) => {
                let detail = params.row;
                return (
                    <div class={MyTableConst.clsPrefix + "action-box"}>
                        {this.storeUser.user.hasAuth(authority.roleSave) && [
                            <a on-click={() => {
                                this.updateStatus(detail);
                            }}>{detail.status == myEnum.roleStatus.启用 ? '禁用' : '启用'}</a>,
                            <a on-click={() => {
                                this.detail = detail;
                                this.detailShow = true;
                            }}>编辑</a>
                        ]}
                        {this.storeUser.user.hasAuth(authority.roleDel) &&
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
                    <RoleDetailView detail={this.detail} on-save-success={() => {
                        this.detailShow = false;
                        this.$refs.table.query();
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
                        {`将要删除${this.delIds.length}项`}
                    </MyConfirm>
                </Modal>
                <MyList
                    ref="table"
                    current={this.page.index}
                    pageSize={this.page.size}
                    queryArgs={{
                        name: {
                            label: '名字',
                        },
                        code: {
                            label: '编码',
                        },
                        authority: {
                            label: '权限',
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
                        add: !this.storeUser.user.hasAuth(authority.roleSave)
                    }}

                    columns={this.getColumns()}

                    queryFn={async (data) => {
                        let rs = await testApi.roleQuery(data);

                        rs.rows.forEach(ele => {
                            if (!ele.authorityList || !ele.authorityList.length)
                                ele._disableExpand = true;
                            else
                                ele._expanded = true;
                        });

                        return rs;
                    }}

                    on-query={(model) => {
                        let q = { ...model.query };
                        this.$router.push({
                            path: this.$route.path,
                            query: {
                                ...q,
                                status: this.statusList.filter(ele => ele.checked).map(ele => ele.value).join(','),
                                page: model.page.index,
                                rows: model.page.size
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

@Component
class RoleTransfer extends Vue {
    @Prop()
    selectedData: DetailDataType[];

    @Watch('selectedData')
    private updateSelectedData(newVal: DetailDataType[]) {
        this.insideSelectedData = newVal ? newVal.map(ele => this.dataConverter(ele)) : [];
    }

    $refs: { transfer: IMyTransfer };
    private insideSelectedData = [];

    getChangeData(key?: string) {
        return this.$refs.transfer.getChangeData(key);
    }

    protected mounted() {
        this.$refs.transfer.loadData();
    }

    private dataConverter(ele: DetailDataType) {
        return {
            key: ele.code,
            label: ele.isDel ? `${ele.code}[已删除]` : `${ele.name}(${ele.code})`,
            data: ele
        };
    }
    private async loadData() {
        let rs = await testApi.roleQuery({ status: myEnum.roleStatus.启用, getAll: true });
        return rs.rows.map(ele => {
            return this.dataConverter(ele);
        });
    }
    protected render() {
        return (
            <MyTransfer
                ref='transfer'
                getDataFn={this.loadData}
                selectedData={this.insideSelectedData}
            >
            </MyTransfer>
        );
    }
}

export interface IRoleTransfer extends RoleTransfer { }
export const RoleTransferView = convClass<RoleTransfer>(RoleTransfer);