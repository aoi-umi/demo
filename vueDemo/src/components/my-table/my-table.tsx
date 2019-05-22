import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import {
    Table, Page, Row, Col,
    Input, Button, Divider, Card, Icon, Spin
} from '@/components/iview';
import './my-table.less';
import { MyTableModel } from './model';
import { ListResult } from '@/api';

@Component
class MyTable extends Vue {
    @Prop()
    columns!: { title: string, key: string, fixed?: string; width?: number; render?: (h: any, params: { row: any }) => any }[];

    @Prop()
    data?: object[];

    @Prop()
    queryArgs?: {
        key: string;
        label?: string;
        placeholder?: string;
    }[];

    @Prop()
    queryFn?: (query: MyTableModel<any>) => ListResult | Promise<ListResult>;

    protected created() {
        this._onQueryClick();
    }

    private async _onQueryClick() {
        this.loading = true;
        try {
            this.result.success = true;
            this.result.msg = '暂无数据';
            let rs = this.queryFn && await this.queryFn(this.model);
            this.result.data = rs.rows;
            this.result.total = rs.total;
        } catch (e) {
            this.result.success = false;
            this.result.data = [];
            this.result.msg = e.message;
        } finally {
            this.loading = false;
        }
    }

    private _onQueryPress(e) {
        if (e.charCode == 13) {
            this._onQueryClick();
        }
    }

    showQuery = true;
    loading = false;
    model = new MyTableModel();
    result = {
        success: true,
        total: 0,
        msg: '',
        data: []
    };

    render() {
        return (
            <div>
                <Card>
                    <div style={{ justifyContent: 'flex-end', display: 'flex' }}>
                        <div style={{ cursor: 'pointer' }} onClick={() => { this.showQuery = !this.showQuery; }}>
                            {this.showQuery ? '隐藏' : '展开'}筛选
                            <Icon type={this.showQuery ? 'ios-arrow-up' : 'ios-arrow-down'} />
                        </div>
                    </div>
                    <div class={this.showQuery ? '' : 'hidden'} onKeypress={this._onQueryPress}>
                        <Row gutter={5}>
                            {this.queryArgs && this.queryArgs.map(ele => {
                                return (
                                    <Col style={{ marginBottom: '5px' }} xs={24} sm={8} md={6}>
                                        {ele.label || ele.key}
                                        <Input placeholder={ele.placeholder} v-model={this.model.query[ele.key]}></Input>
                                    </Col>
                                );
                            })}
                        </Row>
                        <Divider size='small' />
                        <Row gutter={5} type="flex" justify="end">
                            <Col>
                                <Button type="primary" loading={this.loading} onClick={() => {
                                    this._onQueryClick();
                                }}>查询</Button>
                            </Col>
                        </Row>
                    </div>
                </Card>
                <div style={{ position: 'relative' }}>
                    <Table style={{ marginTop: '10px' }} stripe columns={this.columns}
                        data={this.result.data} no-data-text={this.result.msg}>
                    </Table>
                    <Page class="page" total={this.result.total}
                        show-total show-elevator show-sizer
                        on-on-change={(page) => {
                            this.model.page.index = page;
                            this._onQueryClick();
                        }}
                        on-on-page-size-change={(size) => {
                            this.model.page.size = size;
                        }} />
                    {this.loading && <Spin size="large" fix></Spin>}
                </div>
            </div>
        );
    }
}

const MyTableView = MyTable as {
    new(props: Partial<MyTable>): any;
}
export default MyTableView;