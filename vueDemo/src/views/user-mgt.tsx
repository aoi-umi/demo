import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Form as IForm } from 'iview';
import { getModule } from 'vuex-module-decorators';
import { testApi } from '@/api';
import { myEnum, authority } from '@/config';
import { convClass } from '@/helpers';
import { Modal, Form, FormItem, Button } from '@/components/iview';
import { MyList, IMyList, Const as MyTableConst } from '@/components/my-list';
import { MyTagModel } from '@/components/my-tag';
import { MyInput } from '@/components/my-input';
import LoginUserStore from '@/store/loginUser';

export type DetailDataType = {
    _id?: string;
    account?: string;
    nickname?: string;
    roleList?: { code: string; name: string; isDel: boolean; }[];
    authorityList?: { code: string; name: string; isDel: boolean }[];
    auth?: { [code: string]: any };
    createdAt?: string;
}
@Component
class RoleDetail extends Vue {
    @Prop()
    detail: any;

    @Watch('detail')
    updateDetail(newVal) {
        let data = newVal;
        this.initDetail(data);
    }
    private innerDetail: DetailDataType = {};

    private initDetail(data) {
        this.innerDetail = data;
        this.role = '';
        this.authority = '';
        this.authModel = new MyTagModel(this.innerDetail.authorityList.map(ele => {
            let tag = ele.isDel ? ele.code : `${ele.name}(${ele.code})`;
            return {
                tag: tag,
                key: ele.code,
                isDel: ele.isDel,
            };
        }));
        this.roleModel = new MyTagModel(this.innerDetail.roleList.map(ele => {
            let tag = ele.isDel ? ele.code : `${ele.name}(${ele.code})`;
            return {
                tag: tag,
                key: ele.code,
                isDel: ele.isDel,
            };
        }));
    }

    private rules = {
    };
    $refs: { formVaild: IForm };


    private authority = '';
    private role = '';
    private authModel: MyTagModel;
    private roleModel: MyTagModel;
    private authSearchData = [];
    private roleSearchData = [];

    private saving = false;
    private async save() {
        this.saving = true;
        let detail = this.innerDetail;
        try {
            let { addTagList: addAuthList, delTagList: delAuthList } = this.authModel.getChangeTag('key');
            let { addTagList: addRoleList, delTagList: delRoleList } = this.roleModel.getChangeTag('key');
            let rs = await testApi.userMgtSave({
                _id: detail._id,
                addAuthList,
                delAuthList,
                addRoleList,
                delRoleList,
            });
            this.$emit('save-success', rs);
        } catch (e) {
            this.$Message.error('出错了:' + e.message);
        } finally {
            this.saving = false;
        }
    }

    private roleSearching = false;
    private async roleSearch(query) {
        try {
            this.roleSearching = true;
            let rs = await testApi.roleQuery({ anyKey: query, status: myEnum.roleStatus.启用 });
            this.roleSearchData = rs.rows;
        } catch (e) {
            this.$Message.error(e.message);
        } finally {
            this.roleSearching = false;
        }
    }

    private authSearching = false;
    private async authSearch(query) {
        try {
            this.authSearching = true;
            let rs = await testApi.authorityQuery({ anyKey: query, status: myEnum.authorityStatus.启用 });
            this.authSearchData = rs.rows;
        } catch (e) {
            this.$Message.error(e.message);
        } finally {
            this.authSearching = false;
        }
    }

    private getTagText(ele) {
        return `${ele.name}(${ele.code})`;
    }

    protected render() {
        let detail = this.innerDetail;
        return (
            <div>
                <h3>{'修改'}</h3>
                <br />
                <Form label-width={50} ref="formVaild" props={{ model: detail }} rules={this.rules}>
                    <FormItem label="账号">{detail.account}</FormItem>
                    <FormItem label="昵称">{detail.nickname}</FormItem>
                    <FormItem label="角色">
                        {this.roleModel && this.roleModel.renderTag()}
                        <br />
                        <MyInput v-model={this.role} clearable
                            loading={this.roleSearching}
                            on-on-search={this.roleSearch}
                            on-on-select={(val) => {
                                if (!val)
                                    return;
                                let match = this.roleSearchData.find(e => e.code == val);
                                this.roleModel.addTag({ key: match.code, tag: this.getTagText(match), data: match });
                                this.$forceUpdate();
                            }}
                        >
                            {this.roleSearchData.map(ele => {
                                return (
                                    //@ts-ignore
                                    <Option value={ele.code}>{this.getTagText(ele)}</Option>
                                );
                            })}
                        </MyInput>
                    </FormItem>
                    <FormItem label="权限">
                        {this.authModel && this.authModel.renderTag()}
                        <br />
                        <MyInput v-model={this.authority} clearable
                            loading={this.authSearching}
                            on-on-search={this.authSearch}
                            on-on-select={(val) => {
                                if (!val)
                                    return;
                                let match = this.authSearchData.find(e => e.code == val);
                                this.authModel.addTag({ key: match.code, tag: this.getTagText(match), data: match });
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
                            // this.$refs.formVaild.validate((valid) => {
                            //     if (!valid) {
                            //         this.$Message.error('参数有误');
                            //     } else {
                            //         this.save();
                            //     }
                            // })
                            this.save();
                        }} loading={this.saving}>保存</Button>
                    </FormItem>
                </Form>
            </div >
        );
    }
}

const RoleDetailView = convClass<RoleDetail>(RoleDetail);

@Component
export default class UserMgt extends Vue {
    detailShow = false;
    delShow = false;
    detail: any;
    $refs: { table: IMyList<any> };
    get storeUser() {
        return getModule(LoginUserStore, this.$store);
    }

    page: any;
    created() {
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
        ['account', 'nickname', 'role', 'authority', 'anyKey'].forEach(key => {
            if (query[key])
                this.$set(table.model.query, key, query[key]);
        });
        table.model.setPage({ index: query.page, size: query.rows });
        this.$refs.table.query(query);
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
                <MyList
                    ref="table"
                    current={this.page.index}
                    pageSize={this.page.size}

                    queryArgs={{
                        account: {
                            label: '账号'
                        },
                        nickname: {
                            label: '昵称'
                        },
                        role: {
                            label: '角色'
                        },
                        authority: {
                            label: '权限'
                        },
                        anyKey: {
                            label: '任意字'
                        },
                    }}
                    hideQueryBtn={{ add: true, }}

                    columns={[{
                        key: '_expand',
                        type: 'expand',
                        width: 30,
                        render: (h, params) => {
                            let auth = params.row.auth;
                            let enableAuthList: any[] = Object.values(auth);
                            return MyTagModel.renderAuthorityTag(enableAuthList);
                        }
                    }, {
                        title: '账号',
                        key: 'account',
                        minWidth: 120,
                    }, {
                        title: '昵称',
                        key: 'nickname',
                        minWidth: 120,
                    }, {
                        title: '角色',
                        key: 'roleList',
                        minWidth: 120,
                        render: (h, params) => {
                            let roleList = params.row.roleList
                            return MyTagModel.renderRoleTag(roleList);
                        }
                    }, {
                        title: '权限',
                        key: 'authorityList',
                        minWidth: 120,
                        render: (h, params) => {
                            return MyTagModel.renderAuthorityTag(params.row.authorityList);
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
                                    {this.storeUser.user.hasAuth(authority.userMgtEdit) &&
                                        <a on-click={() => {
                                            this.detail = detail;
                                            this.detailShow = true;
                                        }}>编辑</a>
                                    }
                                </div>
                            );
                        }
                    },]}

                    queryFn={async (data) => {
                        let rs = await testApi.userMgtQuery(data);

                        rs.rows.forEach(ele => {
                            if (!ele.auth || !Object.keys(ele.auth).length)
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
                                page: model.page.index,
                                rows: model.page.size
                            }
                        });
                    }}
                >
                </MyList>
            </div>
        );
    }
}