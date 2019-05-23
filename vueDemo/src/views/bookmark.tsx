import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Form as IForm } from 'iview';
import { MyTable } from '@/components/my-table';
import { Tag, Modal, Input, Row, Col, Form, FormItem, Button } from '@/components/iview';
import { testApi } from '@/api';

@Component
class BookmarkDetail extends Vue {
    @Prop()
    detail: any;

    @Watch('detail')
    updateDetail(newVal) {
        this.innerDetail = newVal;
    }
    private innerDetail = {
        _id: '',
        name: '',
        url: '',
    };
    private rules = {
        name: [
            { required: true, trigger: 'blur' }
        ],
        url: [
            { required: true, trigger: 'blur' }
        ],
    };
    private get innerRefs() {
        return this.$refs as { formVaild: IForm }
    }

    render() {
        let detail = this.innerDetail;
        return (
            <div>
                <h3>{detail._id ? '修改' : '新增'}</h3>
                <br />
                <Form label-width={50} ref="formVaild" model={detail} rules={this.rules} on-input={() => { /**不加这个会报错 */ }}>
                    <FormItem label="名字" prop="name">
                        <Input v-model={detail.name} />
                    </FormItem>
                    <FormItem label="url" prop="url">
                        <Input v-model={detail.url} />
                    </FormItem>
                    <FormItem>
                        <Button type="primary" onClick={() => {
                            this.innerRefs.formVaild.validate((valid) => {
                                if (valid) {
                                    this.$Message.success('Success!');
                                } else {
                                    this.$Message.error('Fail!');
                                }
                            })
                        }}>保存</Button>
                    </FormItem>
                </Form>
            </div >
        );
    }
}

const BookmarkDetailView = BookmarkDetail as {
    new(props: Partial<BookmarkDetail> & VueComponentOptions): any;
}

@Component
export default class Bookmark extends Vue {
    detailShow = false;
    detail: any;
    protected render() {
        return (
            <div>
                <Modal v-model={this.detailShow} footer-hide mask-closable={false}>
                    <BookmarkDetailView detail={this.detail}></BookmarkDetailView>
                </Modal>
                <MyTable
                    on-created={(table) => {
                        table.query();
                    }}
                    queryArgs={{
                        name: {
                            label: '名字',
                        },
                        url: {},
                        anyKey: {
                            label: '任意字'
                        }
                    }}
                    columns={[{
                        key: '_selection',
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    }, {
                        key: '_expand',
                        type: 'expand',
                        width: 30,
                        render: (h, params) => {
                            let tagList = params.row.tagList
                            if (tagList && tagList.length) {
                                return tagList.map(ele => {
                                    return (<Tag type="border" color="primary">{ele}</Tag>);
                                });
                            }
                        }
                    }, {
                        title: '名字',
                        key: 'name'
                    }, {
                        title: 'url',
                        key: 'url',
                        render: (h, params) => {
                            return (<a href={params.row.url}>{params.row.url}</a>);
                        }
                    }, {
                        title: '操作',
                        key: 'action',
                        fixed: 'right',
                        width: 120,
                        render: (h, params) => {
                            return (
                                <div class="action-box">
                                    <a onClick={() => {
                                        this.detail = params.row;
                                        this.detailShow = true;
                                    }}>编辑</a>
                                    <a>删除</a>
                                </div>
                            );
                        }
                    },]}

                    queryFn={async (model) => {
                        let q = { ...model.query };
                        let rs = await testApi.bookmarkQuery({
                            ...q,
                            page: model.page.index,
                            rows: model.page.size
                        });

                        rs.rows.forEach(ele => {
                            if (!ele.tagList || !ele.tagList.length)
                                ele._disableExpand = true;
                            else
                                ele._expanded = true;
                        });
                        return rs;
                    }}
                ></MyTable>
            </div>
        );
    }
}