import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Form as IForm } from 'iview';
import { testApi } from '@/api';
import { Tag, Modal, Input, Row, Col, Form, FormItem, Button } from '@/components/iview';
import { MyTable, IMyTable } from '@/components/my-table';
import { MyTagModel, myTag } from '@/components/my-tag';

type DetailDataType = {
    _id?: string;
    name?: string;
    url?: string;
    tagList?: string[];
}
@Component
class BookmarkDetail extends Vue {
    @Prop()
    detail: any;

    tag = '';
    tagModel: MyTagModel;

    @Watch('detail')
    updateDetail(newVal) {
        this.innerDetail = newVal || this.getDetailData();
        this.tagModel = new MyTagModel(this.innerDetail.tagList);
    }
    private innerDetail: DetailDataType = {};
    private getDetailData() {
        return {
            _id: '',
            name: '',
            url: '',
            tagList: []
        };
    }

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

    addTag() {
        let tag = this.tag && this.tag.trim();
        if (tag) {
            this.tagModel.addTag(tag);
            this.tag = '';
        }
    }

    saving = false;
    async save() {
        this.saving = true;
        let detail = this.innerDetail;
        try {
            let addTagList = [], delTagList = [];
            this.tagModel.tagList.map(ele => {
                if (ele.add && ele.selected) {
                    addTagList.push(ele.tag);
                } else if (!ele.add && !ele.selected) {
                    delTagList.push(ele.tag);
                }
            });
            let rs = await testApi.bookmarkSave({
                _id: detail._id,
                name: detail.name,
                url: detail.url,
                addTagList,
                delTagList,
            });
            this.$emit('save-success', rs);
        } catch (e) {
            this.$Message.error('出错了:' + e.message);
        } finally {
            this.saving = false;
        }
    }

    render() {
        let detail = this.innerDetail;
        return (
            <div>
                <h3>{detail._id ? '修改' : '新增'}</h3>
                <br />
                <Form label-width={50} ref="formVaild" props={{ model: detail }} rules={this.rules}>
                    <FormItem label="名字" prop="name">
                        <Input v-model={detail.name} />
                    </FormItem>
                    <FormItem label="url" prop="url">
                        <Input v-model={detail.url} />
                    </FormItem>
                    <FormItem label="标签" >
                        {this.tagModel && this.tagModel.renderTag()}
                        <br />
                        <Row gutter={10}>
                            <Col span={20}>
                                <Input placeholder="回车或点及按钮添加" v-model={this.tag} on-on-enter={this.addTag} />
                            </Col>
                            <Col span={4}><Button on-click={this.addTag}>添加</Button></Col>
                        </Row>
                    </FormItem>
                    <FormItem>
                        <Button type="primary" on-click={() => {
                            this.innerRefs.formVaild.validate((valid) => {
                                if (!valid) {
                                    this.$Message.error('参数有误');
                                } else {
                                    this.save();
                                }
                            })
                        }} loading={this.saving}>保存</Button>
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
    get innerRefs() {
        return this.$refs as { table: IMyTable<any> };
    }
    mounted() {
        this.innerRefs.table.query();
    }
    protected render() {
        return (
            <div>
                <Modal v-model={this.detailShow} footer-hide mask-closable={false}>
                    <BookmarkDetailView detail={this.detail} on-save-success={() => {
                        this.detailShow = false;
                        this.innerRefs.table.query();
                    }} />
                </Modal>
                <MyTable
                    ref="table"
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
                                return myTag.renderTag(tagList);
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
                                    <a on-click={() => {
                                        this.detail = params.row;
                                        this.detailShow = true;
                                    }}>编辑</a>
                                    <a on-click={async () => {
                                        this.$Modal.confirm({
                                            title: '确认删除?',
                                            loading: true,
                                            onOk: async () => {
                                                try {
                                                    await testApi.bookmarkDel([params.row._id]);
                                                    this.$Message.info('删除成功');
                                                    this.$Modal.remove();
                                                    this.innerRefs.table.query();
                                                } catch (e) {
                                                    this.$Message.error('删除失败:' + e.message);
                                                } finally {
                                                }
                                            }
                                        });
                                    }}>删除</a>
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

                    on-add-click={() => {
                        this.detail = null;
                        this.detailShow = true;
                    }}
                ></MyTable>
            </div>
        );
    }
}