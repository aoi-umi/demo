import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import {
    Table, Page, Row, Col,
    Input, Button, Divider, Card, Icon, Spin
} from '@/components/iview';
import './my-table.less';
import { MyTableModel } from './model';

@Component
class MyTable extends Vue {
    @Prop()
    columns!: { title: string, key: string, fixed?: string; width?: number; render?: (h: any, params: { row: any }) => any }[];

    @Prop()
    data?: object[];

    @Prop()
    queryArgs?: {
        id: string;
        label?: string;
        placeholder?: string;
    }[];

    onQuery?: (query) => any;
    private async _onQueryClick() {
        this.loading = true;
        try {
            // console.log(this.model)
            // let rs = this.queryFn && await this.queryFn(this.model);

        } catch (e) {

        } finally {
            this.loading = false;
        }
    }
    private _onQueryPress(e) {
        if (e.charCode == 13) {
            this._onQueryClick();
        }
    }
    private test() {
        console.log(arguments);
    }

    showQuery = true;
    loading = false;
    model = new MyTableModel();

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
                    <div class={this.showQuery ? '' : 'hidden'}>
                        <Row gutter={5} onKeyPress={this._onQueryPress}>
                            {this.queryArgs && this.queryArgs.map(ele => {
                                return (
                                    <Col style={{ marginBottom: '5px' }} xs={24} sm={8} md={6}>
                                        {ele.label}
                                        <Input placeholder={ele.placeholder}></Input>
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
                    <Table style={{ marginTop: '10px' }} stripe columns={this.columns} data={this.data}></Table>
                    <Page class="page" total={100} show-elevator show-sizer
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