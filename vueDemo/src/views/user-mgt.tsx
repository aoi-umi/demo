import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Form as IForm } from 'iview';
import { getModule } from 'vuex-module-decorators';
import moment from 'moment';

import { testApi } from '@/api';
import { myEnum, authority, dev } from '@/config';
import { convClass, convert } from '@/helpers';
import { Modal, Form, FormItem, Button } from '@/components/iview';
import { MyList, IMyList, Const as MyTableConst } from '@/components/my-list';
import { MyTagModel } from '@/components/my-tag';
import LoginUserStore from '@/store/loginUser';
import { AuthorityTransferView, IAuthorityTransfer } from './authority';
import { IRoleTransfer } from './role';

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
    }

    private rules = {
    };
    $refs: { formVaild: IForm; roleTransfer: IRoleTransfer, authTransfer: IAuthorityTransfer };

    private saving = false;
    private async save() {
        this.saving = true;
        let detail = this.innerDetail;
        try {
            let { addList: addAuthList, delList: delAuthList } = this.$refs.authTransfer.getChangeData('key');
            let { addList: addRoleList, delList: delRoleList } = this.$refs.roleTransfer.getChangeData('key');
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

    protected render() {
        let detail = this.innerDetail;
        return (
            <div>
                <h3>{'修改'}</h3>
                <br />
                <Form label-width={50} ref="formVaild" props={{ model: detail }} rules={this.rules}>
                    <FormItem label="账号">{detail.account}({detail.nickname})</FormItem>
                    <FormItem label="角色">
                        <AuthorityTransferView ref="roleTransfer" selectedData={detail.roleList} />
                    </FormItem>
                    <FormItem label="权限">
                        <AuthorityTransferView ref="authTransfer" selectedData={detail.authorityList} />
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
    $refs: { list: IMyList<any> };
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
        let list = this.$refs.list;
        let query = this.$route.query;
        ['account', 'nickname', 'role', 'authority', 'anyKey'].forEach(key => {
            if (query[key])
                this.$set(list.model.query, key, query[key]);
        });
        convert.Test.queryToListModel(query, list.model);
        this.$refs.list.query(query);
    }

    private getColumns() {
        let columns = [{
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
            sortable: 'custom' as any,
            minWidth: 120,
        }, {
            title: '昵称',
            key: 'nickname',
            sortable: 'custom' as any,
            minWidth: 120,
        }, {
            title: '角色',
            key: 'roleList',
            minWidth: 120,
            render: (h, params) => {
                let roleList = params.row.roleList;
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
            title: '创建时间',
            key: 'createdAt',
            sortable: 'custom' as any,
            minWidth: 120,
            render: (h, params) => {
                return <label>{moment(params.row.createdAt).format(dev.dateFormat)}</label>;
            }
        }, {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 150,
            hide: !this.storeUser.user.existsAuth([authority.userMgtEdit]),
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
        }];
        return columns;
    }

    protected render() {
        return (
            <div>
                <Modal v-model={this.detailShow} footer-hide mask-closable={false}>
                    <RoleDetailView detail={this.detail} on-save-success={() => {
                        this.detailShow = false;
                        this.$refs.list.query();
                    }} />
                </Modal>
                <MyList
                    ref="list"
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

                    columns={this.getColumns()}

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
                                ...convert.Test.listModelToQuery(model)
                            }
                        });
                    }}
                >
                </MyList>
            </div>
        );
    }
}