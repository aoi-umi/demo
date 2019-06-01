import { Component, Vue, Prop } from 'vue-property-decorator';

import {
    Table, Page, Row, Col,
    Input, Button, Divider, Card, Icon, Spin
} from '@/components/iview';
import './my-table.less';
import { MyTableModel } from './model';
import { ListResult } from '@/api';

type QueryArgsType = {
    [key: string]: {
        label?: string;
        placeholder?: string;
    }
}

const event = {
    addClick: 'add-click',
    resetClick: 'reset-click'
};
const clsPrefix = 'my-table-';

export const Const = {
    clsPrefix
};
@Component
class MyTable<QueryArgs extends QueryArgsType> extends Vue {
    @Prop()
    columns!: {
        title?: string,
        key?: string,
        fixed?: string;
        width?: number;
        type?: string;
        align?: string;
        render?: (h: any, params: { row: any }) => any
    }[];

    @Prop()
    queryArgs?: QueryArgs;

    @Prop()
    customQueryNode?: any;

    @Prop()
    hideQueryBtn?: {
        all?: boolean;
        add?: boolean;
        reset?: boolean;
        query?: boolean;
    };

    @Prop()
    customOperateView: any;

    @Prop()
    queryFn?: (query: MyTableModel<{ [k in keyof QueryArgs]: any }>) => ListResult | Promise<ListResult>;

    public query() {
        this._onQueryClick();
    }
    private async _onQueryClick() {
        this.loading = true;
        try {
            this.selectedRows = [];
            this.result.success = true;
            this.result.data = [];
            this.result.total = 0;
            this.result.msg = '暂无数据';
            let rs = this.queryFn && await this.queryFn(this.model);
            if (rs) {
                this.result.data = rs.rows;
                this.result.total = rs.total;
            }
        } catch (e) {
            this.result.success = false;
            this.result.msg = e.message;
        } finally {
            this.loading = false;
        }
    }

    private handlePress(e) {
        if (e.charCode == 13) {
            this._onQueryClick();
        }
    }


    private selectedRows = [];
    private setSelectedRows(selection) {
        this.selectedRows = selection;
    }

    //批量操作
    @Prop({ default: () => [] })
    multiOperateBtnList: { text: string; onClick: (selection: any[]) => void }[];

    private showQuery = true;
    private loading = false;
    private model = new MyTableModel<{ [k in keyof QueryArgs]: any }>();
    private result = {
        success: true,
        total: 0,
        msg: '',
        data: []
    };

    private get bottomBarClass() {
        let cls = [clsPrefix + 'bottom-bar'];
        if (this.multiOperateBtnList.length && this.selectedRows.length) {
            cls.push('active');
        }
        return cls;
    }

    private resetQueryArgs() {
        if (this.queryArgs) {
            for (let key in this.queryArgs) {
                this.$set(this.model.query, key, '');
            }
        }
    }

    protected render() {
        let hideQueryBtn = this.hideQueryBtn || {};
        return (
            <div>
                <Card>
                    <div style={{ justifyContent: 'flex-end', display: 'flex' }}>
                        <div style={{ cursor: 'pointer' }} onClick={() => { this.showQuery = !this.showQuery; }}>
                            {this.showQuery ? '隐藏' : '展开'}筛选
                            <Icon type={this.showQuery ? 'ios-arrow-up' : 'ios-arrow-down'} />
                        </div>
                    </div>
                    <div class={[clsPrefix + 'query-args-box'].concat(this.showQuery ? '' : 'collapsed')} on-keypress={this.handlePress}>
                        <Row gutter={5}>
                            {this.queryArgs && Object.entries(this.queryArgs).map(entry => {
                                let key = entry[0];
                                let ele = entry[1];
                                return (
                                    <Col style={{ marginBottom: '5px' }} xs={24} sm={8} md={6}>
                                        {ele.label || key}
                                        <Input placeholder={ele.placeholder} v-model={this.model.query[key]} />
                                    </Col>
                                );
                            })}
                        </Row>
                        {this.customQueryNode}
                        <Divider size='small' />
                        <Row gutter={5} type="flex" justify="end">
                            {(!hideQueryBtn.all && !hideQueryBtn.reset) &&
                                <Col>
                                    <Button on-click={() => {
                                        this.resetQueryArgs();
                                        this.$emit(event.resetClick);
                                    }}>重置</Button>
                                </Col>
                            }
                            {(!hideQueryBtn.all && !hideQueryBtn.query) &&
                                <Col>
                                    <Button type="primary" loading={this.loading} on-click={() => {
                                        this._onQueryClick();
                                    }}>查询</Button>
                                </Col>
                            }
                            {(!hideQueryBtn.all && !hideQueryBtn.add) &&
                                <Col>
                                    <Button on-click={() => {
                                        this.$emit(event.addClick);
                                    }}>新增</Button>
                                </Col>
                            }
                            {this.customOperateView}
                        </Row>
                    </div>
                </Card>
                <div style={{ position: 'relative', }}>
                    <Table style={{ marginTop: '10px' }} stripe columns={this.columns}
                        data={this.result.data} no-data-text={this.result.msg}
                        on-on-selection-change={this.setSelectedRows}>
                    </Table>
                    <Page class={clsPrefix + "page"} total={this.result.total}
                        current={this.model.page.index}
                        show-total show-elevator show-sizer
                        on-on-change={(page) => {
                            this.model.page.index = page;
                            this._onQueryClick();
                        }}
                        on-on-page-size-change={(size) => {
                            this.model.page.index = 1;
                            this.model.page.size = size;
                        }} />
                    {this.loading && <Spin size="large" fix></Spin>}
                </div>
                <Card class={this.bottomBarClass}>
                    {this.multiOperateBtnList.map(ele => {
                        return (
                            <Button on-click={() => { ele.onClick && ele.onClick(this.selectedRows) }}>{ele.text}</Button>
                        );
                    })}
                </Card>
            </div>
        );
    }
}

export interface IMyTable<T extends QueryArgsType> extends MyTable<T> { }
const MyTableView = MyTable as {
    new <T extends QueryArgsType>(props: Partial<MyTable<T>> & VueComponentOptions): any;
}
export default MyTableView;