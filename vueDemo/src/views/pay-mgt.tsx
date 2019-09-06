import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Form as IForm } from 'iview';
import moment from 'moment';
import { testApi } from '@/api';
import { myEnum, authority, dev } from '@/config';
import { Modal, Input, Form, FormItem, Button, Checkbox, RadioGroup, Radio } from '@/components/iview';
import { MyList, IMyList, Const as MyTableConst } from '@/components/my-list';
import { convClass, convert } from '@/helpers';
import { Base } from './base';
import { UserAvatarView } from './comps/user-avatar';

type DetailDataType = {
    _id?: string;
    type?: string;
    title?: string;
    content?: number;
    status?: number;
    statusText?: number;
    refundStatus?: number;
    refundStatusText?: number;
    money?: number;
};
@Component
class PayMgtDetail extends Base {
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
            title: '',
            content: '',
            money: '',
            type: myEnum.assetSourceType.支付宝
        };
    }

    private initDetail(data) {
        this.innerDetail = data;
    }

    typeList: { key: string; value: any, checked?: boolean }[] = [];
    created() {
        this.typeList = myEnum.assetSourceType.toArray().filter(ele => ele.value === myEnum.assetSourceType.支付宝).map(ele => {
            ele['checked'] = false;
            return ele;
        });
    }

    private rules = {
        title: [
            { required: true, trigger: 'blur' }
        ],
        content: [
            { required: true, trigger: 'blur' }
        ],
        money: [
            { required: true, trigger: 'blur' }
        ],
    };
    $refs: { formVaild: IForm };

    saving = false;
    async handleSave() {
        await this.operateHandler('创建', async () => {
            this.saving = true;
            let detail = this.innerDetail;
            let rs = await testApi.payCreate({
                type: detail.type,
                title: detail.title,
                content: detail.content,
                money: detail.money,
            });
            window.open(rs.url, '_blank');
            this.$emit('save-success', rs);
            this.initDetail(this.getDetailData());
        }, {
                validate: this.$refs.formVaild.validate
            }
        ).finally(() => {
            this.saving = false;
        });
    }

    render() {
        let detail = this.innerDetail;
        return (
            <div>
                <h3>{detail._id ? '详情' : '新增'}</h3>
                <br />
                <Form label-width={80} ref="formVaild" props={{ model: detail }} rules={this.rules}>
                    <FormItem label="标题" prop="title">
                        <Input v-model={detail.title} />
                    </FormItem>
                    <FormItem label="内容" prop="content">
                        <Input v-model={detail.content} />
                    </FormItem>
                    <FormItem label="价格" prop="money">
                        <Input v-model={detail.money} />
                    </FormItem>
                    <FormItem label="支付方式" prop="type">
                        <RadioGroup v-model={detail.type}>
                            {this.typeList.map(ele => {
                                return <Radio label={ele.value}>{ele.key}</Radio>;
                            })}
                        </RadioGroup>
                    </FormItem>
                    {!detail._id && <FormItem>
                        <Button type="primary" on-click={() => {
                            this.handleSave();
                        }} loading={this.saving}>提交</Button>
                    </FormItem>}
                </Form>
            </div >
        );
    }
}

const PayDetailView = convClass<PayMgtDetail>(PayMgtDetail);

@Component
export default class Pay extends Base {
    detailShow = false;
    delShow = false;
    detail: any;
    $refs: { list: IMyList<any> };

    protected created() {
        this.statusList = myEnum.payStatus.toArray().map(ele => {
            ele['checked'] = false;
            return ele;
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
        list.setQueryByKey(query, ['orderNo', 'outOrderNo', 'anyKey']);
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

    private getColumns() {
        let columns = [];
        if (this.storeUser.user.hasAuth(authority.payMgt)) {
            columns.push({
                title: '用户',
                key: 'user',
                minWidth: 120,
                render: (h, params) => {
                    let detail = params.row;
                    return (
                        <UserAvatarView user={detail.user} style={{ margin: '5px' }} />
                    );
                }
            });
        }
        columns = [...columns, {
            title: '单号',
            key: 'orderNo',
            minWidth: 120,
        }, {
            title: '标题',
            key: 'title',
            minWidth: 120,
        }, {
            title: '内容',
            key: 'content',
            minWidth: 120,
        }, {
            title: '金额',
            key: 'money',
            minWidth: 80,
        }, {
            title: '支付类型',
            key: 'typeText',
            minWidth: 80,
        }, {
            title: '外部单号',
            key: 'outOrderNo',
            minWidth: 120,
        }, {
            title: '状态',
            key: 'statusText',
            minWidth: 80,
        }, {
            title: '创建时间',
            key: 'createdAt',
            minWidth: 80,
            render: (h, params) => {
                let detail = params.row;
                return (
                    <span>{moment(detail.createdAt).format(dev.dateFormat)}</span>
                );
            }
        }, {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 150,
            render: (h, params) => {
                let detail = params.row;
                return (
                    <div class={MyTableConst.clsActBox}>

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
                    <PayDetailView detail={this.detail} on-save-success={() => {
                        this.detailShow = false;
                        this.$refs.list.query();
                    }} />
                </Modal>
                <MyList
                    ref="list"
                    queryArgs={{
                        orderNo: {
                            label: '单号'
                        },
                        outOrderNo: {
                            label: '外部单号'
                        },
                        anyKey: {
                            label: '任意字',
                        },

                    }}
                    customQueryNode={this.statusList.map(ele => {
                        return (
                            <label style={{ marginRight: '5px' }}>
                                <Checkbox v-model={ele.checked} />{ele.key}
                            </label>
                        );
                    })}

                    columns={this.getColumns()}

                    queryFn={async (data) => {
                        let rs = await testApi.payQuery(data);
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
                >
                </MyList>
            </div>
        );
    }
}