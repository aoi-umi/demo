import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import moment from 'moment';

import { convClass, convert } from '@/helpers';
import * as helpers from '@/helpers';
import { dev, myEnum } from '@/config';
import { testApi, testSocket } from '@/api';
import { Modal, Input, Button, Card, Row, Col, Checkbox, Tabs, TabPane } from '@/components/iview';
import { Base } from './base';
import { MyList, IMyList, Const as MyListConst } from '@/components/my-list';


@Component
export default class AssetMgt extends Base {
    render() {
        return (
            <Row gutter={5}>
                <Col xs={8}>
                    <Card nativeOn-click={() => {
                        this.$router.push(dev.routeConfig.assetMgtLog.path);
                    }}>资金记录</Card>
                </Col>
                <Col xs={8}>
                    <Card nativeOn-click={() => {
                        this.$router.push(dev.routeConfig.assetMgtNotify.path);
                    }}>回调通知</Card>
                </Col>
            </Row>
        );
    }
}

@Component
export class AssetMgtLog extends Base {
    $refs: { list: IMyList<any> };
    protected created() {
        this.statusList = myEnum.assetLogStatus.toArray().map(ele => {
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
        list.setQueryByKey(query, ['orderNo', 'outOrderNo']);
        let status = this.$route.query.status as string;
        let statusList = status ? status.split(',') : [];
        this.statusList.forEach(ele => {
            ele.checked = statusList.includes(ele.value.toString());
        });
        convert.Test.queryToListModel(query, list.model);
        this.$refs.list.query(query);
    }

    statusList: { key: string; value: any, checked?: boolean }[] = [];

    render() {
        return (
            <MyList
                ref="list"
                queryArgs={{
                    orderNo: {
                        label: '订单号',
                    },
                    outOrderNo: {
                        label: '外部订单号',
                    },
                }}

                customQueryNode={this.statusList.map(ele => {
                    return (
                        <label style={{ marginRight: '5px' }}>
                            <Checkbox v-model={ele.checked} />{ele.key}
                        </label>
                    );
                })}

                columns={[{
                    title: '订单号',
                    key: 'orderNo',
                }, {
                    title: '外部订单号',
                    key: 'outOrderNo',
                }, {
                    title: '金额',
                    key: 'money',
                }, {
                    title: '支付方式',
                    key: 'sourceTypeText',
                }, {
                    title: '状态',
                    key: 'statusText',
                }, {
                    title: '通知id',
                    key: 'notifyId',
                }, {
                    title: '备注',
                    key: 'remark',
                }, {
                    title: '创建时间',
                    key: 'createdAt',
                    render: (h, params) => {
                        return <span>{moment(params.row.createdAt).format(dev.dateFormat)}</span>
                    }
                }]}

                queryFn={async (data) => {
                    let rs = await testApi.assetLogQuery(data);
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

            />
        );
    }
}

@Component
export class AssetMgtNotify extends Base {
    $refs: { list: IMyList<any> };
    protected created() {
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
        list.setQueryByKey(query, ['orderNo', 'outOrderNo']);
        let status = this.$route.query.status as string;
        convert.Test.queryToListModel(query, list.model);
        this.$refs.list.query(query);
    }

    render() {
        return (
            <MyList
                ref="list"
                queryArgs={{
                    orderNo: {
                        label: '订单号',
                    },
                    outOrderNo: {
                        label: '外部订单号',
                    },
                }}

                columns={[{
                    key: '_expand',
                    type: 'expand',
                    width: 30,
                    render: (h, params) => {
                        let detail = params.row;
                        return (
                            <Tabs>
                                <TabPane label="通知">
                                    <pre>{JSON.stringify(detail.value, null, '\t')}</pre>
                                </TabPane>
                                <TabPane label="原通知">
                                    <div style={{ wordWrap: 'break-word' }}>{JSON.stringify(detail.raw)}</div>
                                </TabPane>
                            </Tabs>
                        );
                    }
                }, {
                    title: '订单号',
                    key: 'orderNo',
                }, {
                    title: '外部订单号',
                    key: 'outOrderNo',
                }, {
                    title: '类型',
                    key: 'typeText',
                }, {
                    title: '资金记录状态',
                    key: 'assetLogStatus',
                    render: (h, params) => {
                        let detail = params.row;
                        return (
                            !!detail.assetLog &&
                            <div>
                                <span>{detail.assetLog.statusText}</span>
                                {myEnum.assetLogStatus.未完成 === detail.assetLog.status && <a on-click={() => {
                                    this.operateHandler('重试', async () => {
                                        await testApi.assetNotifyRetry({ _id: detail._id });
                                        detail.assetLog.status = myEnum.assetLogStatus.已完成;
                                    });
                                }}>重试</a>}
                            </div>
                        );
                    }
                }, {
                    title: '创建时间',
                    key: 'createdAt',
                    render: (h, params) => {
                        return <span>{moment(params.row.createdAt).format(dev.dateFormat)}</span>
                    }
                }]}

                queryFn={async (data) => {
                    let rs = await testApi.assetNotifyQuery(data);
                    return rs;
                }}

                on-query={(model) => {
                    let q = { ...model.query };
                    this.$router.push({
                        path: this.$route.path,
                        query: {
                            ...q,
                            ...convert.Test.listModelToQuery(model),
                        }
                    });
                }}

            />
        );
    }
}