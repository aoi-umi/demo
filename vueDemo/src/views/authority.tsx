import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Form as IForm } from 'iview';
import { testApi } from '@/api';
import { myEnum } from '@/config/enum';
import { Modal, Input, Form, FormItem, Button, Checkbox, Switch } from '@/components/iview';
import { MyTable, IMyTable } from '@/components/my-table';
import { MyConfirm } from '@/components/my-confirm';
import { convClass } from '@/helpers';

type DetailDataType = {
    _id?: string;
    name?: string;
    code?: string;
    status?: number;
}
@Component
class AuthorityDetail extends Vue {
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
            status: myEnum.authorityStatus.启用
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
    private get innerRefs() {
        return this.$refs as { formVaild: IForm }
    }

    saving = false;
    async save() {
        this.saving = true;
        let detail = this.innerDetail;
        try {
            let rs = await testApi.authoritySave({
                _id: detail._id,
                name: detail.name,
                code: detail.code,
                status: detail.status,
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
                        <Switch v-model={detail.status} true-value={myEnum.authorityStatus.启用} false-value={myEnum.authorityStatus.禁用} />
                    </FormItem>
                    <FormItem label="名字" prop="name">
                        <Input v-model={detail.name} />
                    </FormItem>
                    <FormItem label="编码" prop="code">
                        <Input v-model={detail.code} />
                    </FormItem>
                    <FormItem>
                        <Button type="primary" on-click={() => {
                            this.innerRefs.formVaild.validate((valid) => {
                                if (!valid) {
                                    this.$Message.error('参数有误');
                                } else {
                                    this.save();
                                }
                            })
                        }} loading={this.saving}>保存</Button>
                    </FormItem>
                </Form>
            </div >
        );
    }
}

const AuthorityDetailView = convClass<AuthorityDetail>(AuthorityDetail);

@Component
export default class Authority extends Vue {
    detailShow = false;
    delShow = false;
    detail: any;
    get innerRefs() {
        return this.$refs as { table: IMyTable<any> };
    }
    protected created() {
        this.statusList = myEnum.authorityStatus.toArray().map(ele => {
            ele['checked'] = false;
            return ele;
        });

    }
    protected mounted() {
        this.innerRefs.table.query();
    }

    delIds = [];
    statusList: { key: string; value: any, checked?: boolean }[] = [];
    async delClick() {
        try {
            await testApi.authorityDel(this.delIds);
            this.$Message.info('删除成功');
            this.delIds = [];
            this.delShow = false;
            this.innerRefs.table.query();
        } catch (e) {
            this.$Message.error('删除失败:' + e.message);
        }
    }
    private async updateStatus(detail: DetailDataType) {
        try {
            let toStatus = detail.status == myEnum.authorityStatus.启用 ? myEnum.authorityStatus.禁用 : myEnum.authorityStatus.启用;
            await testApi.authorityUpdate({ _id: detail._id, status: toStatus });
            detail.status = toStatus;
            this.$Message.info('修改成功');
        } catch (e) {
            this.$Message.error('修改失败:' + e.message);
        }
    }
    protected render() {
        return (
            <div>
                <Modal v-model={this.detailShow} footer-hide mask-closable={false}>
                    <AuthorityDetailView detail={this.detail} on-save-success={() => {
                        this.detailShow = false;
                        this.innerRefs.table.query();
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
                <MyTable
                    ref="table"
                    queryArgs={{
                        name: {
                            label: '名字',
                        },
                        code: {
                            label: '编码',
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

                    columns={[{
                        key: '_selection',
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    }, {
                        title: '名字',
                        key: 'name'
                    }, {
                        title: '编码',
                        key: 'code',
                    }, {
                        title: '状态',
                        key: 'status',
                        render: (h, params) => {
                            let text = myEnum.authorityStatus.getKey(params.row.status);
                            return <span>{text}</span>;
                        }
                    }, {
                        title: '操作',
                        key: 'action',
                        fixed: 'right',
                        width: 150,
                        render: (h, params) => {
                            let detail = params.row;
                            return (
                                <div class="action-box">
                                    <a on-click={() => {
                                        this.updateStatus(detail);
                                    }}>{detail.status == myEnum.authorityStatus.启用 ? '禁用' : '启用'}</a>
                                    <a on-click={() => {
                                        this.detail = detail;
                                        this.detailShow = true;
                                    }}>编辑</a>
                                    <a on-click={() => {
                                        this.delIds = [detail._id];
                                        this.delShow = true;
                                    }}>删除</a>
                                </div>
                            );
                        }
                    },]}

                    queryFn={async (model) => {
                        let q = { ...model.query };
                        let rs = await testApi.authorityQuery({
                            ...q,
                            status: this.statusList.filter(ele => ele.checked).map(ele => ele.value).join(','),
                            page: model.page.index,
                            rows: model.page.size
                        });

                        return rs;
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

                    multiOperateBtnList={[{
                        text: '批量删除',
                        onClick: (selection) => {
                            this.delIds = selection.map(ele => ele._id);
                            this.delShow = true;
                        }
                    }]}
                >
                </MyTable>
            </div>
        );
    }
}