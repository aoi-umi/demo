import { Component, Vue, Prop } from 'vue-property-decorator';

import {
    Table, Page, Row, Col,
    Input, Button, Divider, Card, Icon, Spin
} from '@/components/iview';
import './my-list.less';
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
    resetClick: 'reset-click',
    query: 'query'
};
const clsPrefix = 'my-list-';

export const Const = {
    clsPrefix
};

type ResultType = {
    success: boolean,
    total: number,
    msg: string,
    data: any[]
}
@Component
class MyList<QueryArgs extends QueryArgsType> extends Vue {
    @Prop({
        default: 'table'
    })
    type: 'table' | 'custom';

    @Prop()
    columns?: {
        type?: string;
        title?: string,
        key?: string,
        width?: number;
        minWidth?: number;
        maxWidth?: number;
        align?: string;
        className?: string;
        fixed?: string;
        ellipsis?: boolean;
        tooltip?: boolean;
        render?: (h: any, params: { row: any; column: any }) => any;
        renderHeader?: (h: any, params: { column: any }) => any;
        indexMethod?: () => any;
        sortable?: boolean | 'custom';
        sortMethod?: () => any;
        sortType?: 'asc' | 'desc';
    }[];

    @Prop()
    customRenderFn?: (result: ResultType) => any;

    @Prop()
    pageSize: number | string;

    @Prop()
    current?: number | string;

    @Prop()
    data?: any[];

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
    queryFn?: (data: any) => ListResult | Promise<ListResult>;

    protected created() {
        if (this.type == 'table' && !this.columns) {
            throw new Error(`type 'table' require 'columns'!`);
        } else if (this.type == 'custom' && !this.customRenderFn) {
            throw new Error(`type 'custom' require 'customRenderFn'!`);
        }
        if (this.data) {
            this.result.data = this.data;
            this.result.total = this.data.length;
        } else {
            this.result.msg = '暂无数据';
        }
        this.model.setPage({ index: this.current, size: this.pageSize });
    }
    public query(data?: any) {
        this._handleQuery(data);
    }
    private async _handleQuery(data?: any) {
        this.loading = true;
        try {
            this.selectedRows = [];
            this.result.success = true;
            this.result.data = [];
            this.result.total = 0;
            this.result.msg = '暂无数据';
            let rs = this.queryFn && await this.queryFn(data);
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

    private handleQuery() {
        //防止页面不跳转
        this.model.query._t = Date.now();
        this.$emit('query', this.model);
    }

    private handlePress(e) {
        if (e.charCode == 13) {
            this.handleQuery();
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
    model = new MyTableModel<{ [k in keyof QueryArgs]: any }>();
    private result: ResultType = {
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
                                        this.handleQuery();
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
                    {this.$slots.default}
                    {this.type == 'table' ?
                        <Table style={{ marginTop: '10px' }} columns={this.columns}
                            data={this.result.data} no-data-text={this.result.msg}
                            on-on-selection-change={this.setSelectedRows}>
                        </Table> :
                        this.customRenderFn(this.result)
                    }
                    <Page class={clsPrefix + "page"} total={this.result.total}
                        current={this.model.page.index}
                        page-size={this.model.page.size}
                        show-total show-elevator show-sizer
                        on-on-change={(page) => {
                            this.model.page.index = page;
                            this.handleQuery();
                        }}
                        on-on-page-size-change={(size) => {
                            let oldIdx = this.model.page.index;
                            this.model.page.index = 1;
                            this.model.page.size = size;
                            if (oldIdx == 1) {
                                this.handleQuery();
                            }
                        }} />
                    {this.loading && <Spin size="large" fix></Spin>}
                </div>
                <Card class={this.bottomBarClass}>
                    {this.multiOperateBtnList.map(ele => {
                        return (
                            <Button on-click={() => { ele.onClick && ele.onClick(this.selectedRows); }}>{ele.text}</Button>
                        );
                    })}
                </Card>
            </div>
        );
    }
}

export interface IMyList<T extends QueryArgsType> extends MyList<T> { }
const MyListView = MyList as {
    new <T extends QueryArgsType>(props: Partial<MyList<T>> & VueComponentOptions): any;
};
export default MyListView;