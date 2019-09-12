import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import * as iview from 'iview';
import moment from 'moment';
import { testApi } from '@/api';
import { myEnum, authority, dev } from '@/config';
import { Modal, Input, Form, FormItem, Button, Checkbox, RadioGroup, Radio, InputNumber, DatePicker, Row, Col } from '@/components/iview';
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
            money: 1,
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
    };
    $refs: { formVaild: iview.Form };

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
                        <InputNumber v-model={detail.money} min={0.01} precision={2} active-change={false} />
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
        list.setQueryByKey({
            ...query,
            createdAt: [query.createdAtFrom || '', query.createdAtTo || ''],
        }, ['orderNo', 'outOrderNo', 'anyKey', 'createdAt']);
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
        if (this.storeUser.user.hasAuth(authority.payMgtQuery)) {
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
                        {detail.canPay && <a on-click={() => {
                            this.operateHandler('发起支付', async () => {
                                let rs = await testApi.paySubmit({
                                    _id: detail._id,
                                });
                                window.open(rs.url, '_blank');
                            }, { noSuccessHandler: true });
                        }}>支付</a>}
                        {detail.canCancel && <a on-click={() => {
                            this.operateHandler('取消', async () => {
                                let rs = await testApi.payCancel({
                                    _id: detail._id,
                                });
                                let data = this.$refs.list.result.data;
                                data.splice(data.findIndex(ele => ele._id === detail._id), 1, {
                                    ...detail,
                                    ...rs,
                                });
                            });
                        }}>取消</a>}
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
                        createdAt: {
                            label: '创建时间',
                            comp: (query) => <DatePicker class="ivu-input-wrapper" type="daterange" v-model={query['createdAt']} />
                        },

                    }}
                    customQueryNode={
                        <div>
                            {this.statusList.map(ele => {
                                return (
                                    <label style={{ marginRight: '5px' }}>
                                        <Checkbox v-model={ele.checked} />{ele.key}
                                    </label>
                                );
                            })}
                        </div>}

                    columns={this.getColumns()}

                    queryFn={async (data) => {
                        let rs = await testApi.payQuery(data);
                        return rs;
                    }}

                    on-query={(model) => {
                        let { createdAt, ...q } = model.query;
                        this.$router.push({
                            path: this.$route.path,
                            query: {
                                ...q,
                                createdAtFrom: createdAt[0] ? createdAt[0].toISOString() : undefined,
                                createdAtTo: createdAt[1] ? createdAt[1].toISOString() : undefined,
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