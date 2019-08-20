import { Component, Vue, Prop } from 'vue-property-decorator';

import {
    Table, Page, Row, Col,
    Input, Button, Divider, Card, Icon, Spin
} from '@/components/iview';
import './my-list.less';
import { MyListModel } from './model';
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
    query: 'query',
};
const clsPrefix = 'my-list-';

export const Const = {
    clsPrefix
};

export type ResultType = {
    success: boolean,
    total: number,
    msg: string,
    data: any[]
}

export type OnSortChangeOptions = { column: any, key: string, order: string };

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

        //自定义字段
        hide?: boolean;
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
    hideSearchBox?: boolean;

    //下拉刷新
    @Prop()
    infiniteScroll?: boolean;

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

        window.addEventListener('scroll', () => {
            if (this.infiniteScroll && this.isScrollEnd()) {
                this.scrollEndHandler();
            }
        });
    }

    private isScrollEnd() {
        let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        let clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
        let scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        return scrollTop + clientHeight == scrollHeight;
    }

    private scrollEndHandler() {
        if (!this.loadedLastPage && !this.loading) {
            this.handleQuery({ noClear: true });
        }
    }
    public query(data?: any, noClear?: boolean) {
        return this._handleQuery(data, noClear);
    }
    private async _handleQuery(data?: any, noClear?: boolean) {
        this.loading = true;
        try {
            this.selectedRows = [];
            this.result.success = true;
            if (!noClear)
                this.result.data = [];
            this.result.total = 0;
            this.result.msg = '加载中';
            let rs = this.queryFn && await this.queryFn(data);
            if (rs) {
                if (this.infiniteScroll)
                    this.result.data = [...this.result.data, ...rs.rows];
                else
                    this.result.data = rs.rows;
                this.result.total = rs.total;
            }
            if (!this.result.data.length)
                this.result.msg = '暂无数据';
            let lastPage = Math.ceil(this.result.total / this.model.page.size);
            this.loadedLastPage = this.model.page.index >= lastPage;
            if (this.infiniteScroll && !this.loadedLastPage) {
                this.model.page.index++;
            }
        } catch (e) {
            this.result.success = false;
            this.result.msg = e.message;
            if (this.infiniteScroll)
                this.$Message.error(this.result.msg);
        } finally {
            this.loading = false;
        }
    }

    handleQuery(opt?: {
        noClear?: boolean;
        resetPage?: boolean;
    }) {
        opt = {
            ...opt
        };
        //防止使用router的时候页面不跳转
        (this.model.query as any)._t = Date.now();
        if (opt.resetPage)
            this.model.page.index = 1;
        this.$emit('query', this.model, opt.noClear);
    }

    private handlePress(e) {
        if (e.charCode == 13) {
            this.handleQuery({ resetPage: true });
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
    model = new MyListModel<{ [k in keyof QueryArgs]: any }>();
    setQueryByKey(data, keyList: string[]) {
        keyList.forEach(key => {
            if (data[key])
                this.$set(this.model.query, key, data[key]);
        });
    }
    result: ResultType = {
        success: true,
        total: 0,
        msg: '',
        data: []
    };
    loadedLastPage = false;

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
                {!this.hideSearchBox &&
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
                                            this.handleQuery({ resetPage: true });
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
                }
                <div style={{ position: 'relative', }}>
                    {this.$slots.default}
                    {this.type == 'table' ?
                        <Table style={{ marginTop: '10px' }} columns={this.columns.filter(ele => {
                            let sort = this.model.sort;
                            ele.sortType = '' as any;
                            if (sort.orderBy && sort.sortOrder) {
                                if (ele.key == sort.orderBy) {
                                    ele.sortType = sort.sortOrder as any;
                                }
                            }
                            return !ele.hide;
                        })}
                            data={this.result.data} no-data-text={this.result.msg}
                            on-on-selection-change={this.setSelectedRows}
                            on-on-sort-change={(opt: OnSortChangeOptions) => {
                                let sortMap = {
                                    asc: 1,
                                    desc: -1
                                };
                                let orderBy, sortOrder = sortMap[opt.order];
                                if (sortOrder)
                                    orderBy = opt.key;
                                this.model.setSort({
                                    orderBy,
                                    sortOrder,
                                });
                                this.handleQuery({ resetPage: true });
                            }}>
                        </Table> :
                        this.customRenderFn(this.result)
                    }
                    {!this.infiniteScroll &&
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
                    }
                    {!this.infiniteScroll ?
                        this.loading && <Spin size="large" fix /> :
                        <div class={(() => {
                            let cls = [clsPrefix + 'bottom-loading'];
                            if (this.loading || !this.result.success) {
                            } else {
                                cls.push('invisibility');
                            }
                            return cls;
                        })()}>
                            <Card>{this.result.msg}
                                {this.loading && <Spin size="large" fix />}
                            </Card>
                        </div>
                    }
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