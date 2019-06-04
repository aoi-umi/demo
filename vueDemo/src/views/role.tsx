import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Form as IForm } from 'iview';
import { testApi } from '@/api';
import { myEnum } from '@/config';
import { convClass } from '@/helpers';
import { Modal, Input, Form, FormItem, Button, Checkbox, Switch } from '@/components/iview';
import { MyList, IMyList, Const as MyTableConst } from '@/components/my-list';
import { MyConfirm } from '@/components/my-confirm';
import { MyTagModel } from '@/components/my-tag';
import { MyInput } from '@/components/my-input';

type DetailDataType = {
    _id?: string;
    name?: string;
    code?: string;
    status?: number;
    authorityList?: { code: string; name: string }[];
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
        this.authority = '';
        this.tagModel = new MyTagModel(this.innerDetail.authorityList.map(ele => {
            return {
                tag: `${ele.name}(${ele.code})`,
                key: ele.code
            };
        }));
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

    private authority = '';
    private tagModel: MyTagModel;
    private authSearchData = [];


    private saving = false;
    private async save() {
        this.saving = true;
        let detail = this.innerDetail;
        try {
            let { addTagList, delTagList } = this.tagModel.getChangeTag('key');
            let rs = await testApi.roleSave({
                _id: detail._id,
                name: detail.name,
                code: detail.code,
                status: detail.status,
                addAuthList: addTagList,
                delAuthList: delTagList,
            });
            this.$emit('save-success', rs);
            this.initDetail(this.getDetailData());
        } catch (e) {
            this.$Message.error('出错了:' + e.message);
        } finally {
            this.saving = false;
        }
    }

    private searching = false;
    private async search(query) {
        try {
            this.searching = true;
            let rs = await testApi.authorityQuery({ anyKey: query, status: myEnum.authorityStatus.启用 });
            this.authSearchData = rs.rows;
        } catch (e) {
            this.$Message.error(e.message);
        } finally {
            this.searching = false;
        }
    }

    private getTagText(ele) {
        return `${ele.name}(${ele.code})`;
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
                        {this.tagModel && this.tagModel.renderTag()}
                        <br />
                        <MyInput v-model={this.authority} clearable
                            loading={this.searching}
                            on-on-search={this.search}
                            on-on-select={(val) => {
                                if (!val)
                                    return;
                                let match = this.authSearchData.find(e => e.code == val);
                                this.tagModel.addTag({ key: match.code, tag: this.getTagText(match), data: match });
                                this.$forceUpdate();
                            }}
                        >
                            {this.authSearchData.map(ele => {
                                return (
                                    //@ts-ignore
                                    <Option value={ele.code}>{this.getTagText(ele)}</Option>
                                );
                            })}
                        </MyInput>
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

const RoleDetailView = convClass<RoleDetail>(RoleDetail);

@Component
export default class Role extends Vue {
    detailShow = false;
    delShow = false;
    detail: any;
    get innerRefs() {
        return this.$refs as { table: IMyList<any> };
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
        let table = this.innerRefs.table;
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
        this.innerRefs.table.query(query);
    }

    delIds = [];
    statusList: { key: string; value: any, checked?: boolean }[] = [];
    async delClick() {
        try {
            await testApi.roleDel(this.delIds);
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
            let toStatus = detail.status == myEnum.roleStatus.启用 ? myEnum.roleStatus.禁用 : myEnum.roleStatus.启用;
            await testApi.roleUpdate({ _id: detail._id, status: toStatus });
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
                    <RoleDetailView detail={this.detail} on-save-success={() => {
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
                        key: '_expand',
                        type: 'expand',
                        width: 30,
                        render: (h, params) => {
                            let authorityList = params.row.authorityList
                            if (authorityList && authorityList.length) {
                                return MyTagModel.renderTag(authorityList.map(ele => {
                                    return {
                                        tag: `${ele.name}(${ele.code})`,
                                        color: ele.status == myEnum.authorityStatus.启用 ? '' : 'default'
                                    }
                                }));
                            }
                        }
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
                            let text = myEnum.roleStatus.getKey(params.row.status);
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
                                <div class={MyTableConst.clsPrefix + "action-box"}>
                                    <a on-click={() => {
                                        this.updateStatus(detail);
                                    }}>{detail.status == myEnum.roleStatus.启用 ? '禁用' : '启用'}</a>
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
                        })
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
                </MyList>
            </div>
        );
    }
}