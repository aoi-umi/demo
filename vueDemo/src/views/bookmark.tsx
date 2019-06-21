import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Form as IForm } from 'iview';
import { testApi } from '@/api';
import { Tag, Modal, Input, Row, Col, Form, FormItem, Button } from '@/components/iview';
import { MyList, IMyList, Const as MyTableConst } from '@/components/my-list';
import { MyTagModel } from '@/components/my-tag';
import { MyConfirm } from '@/components/my-confirm';
import { convClass } from '@/helpers';

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
        let data = newVal || this.getDetailData();
        this.initDetail(data);
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

    private initDetail(data) {
        this.innerDetail = data;
        this.tagModel = new MyTagModel(this.innerDetail.tagList);
    }

    private rules = {
        name: [
            { required: true, trigger: 'blur' }
        ],
        url: [
            { required: true, trigger: 'blur' }
        ],
    };

    $refs: { formVaild: IForm };

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
            let { addTagList, delTagList } = this.tagModel.getChangeTag('key');
            let rs = await testApi.bookmarkSave({
                _id: detail._id,
                name: detail.name,
                url: detail.url,
                addTagList,
                delTagList,
            });
            this.$emit('save-success', rs);
            this.initDetail(this.getDetailData());
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
                                <Input placeholder="回车或点击按钮添加" v-model={this.tag} on-on-enter={this.addTag} />
                            </Col>
                            <Col span={4}><Button on-click={this.addTag}>添加</Button></Col>
                        </Row>
                    </FormItem>
                    <FormItem>
                        <Button type="primary" on-click={() => {
                            this.$refs.formVaild.validate((valid) => {
                                if (!valid) {
                                    this.$Message.error('参数有误');
                                } else {
                                    this.save();
                                }
                            });
                        }} loading={this.saving}>保存</Button>
                    </FormItem>
                </Form>
            </div >
        );
    }
}

const BookmarkDetailView = convClass<BookmarkDetail>(BookmarkDetail);


@Component
export default class Bookmark extends Vue {
    detailShow = false;
    delShow = false;
    detail: any;
    $refs: { list: IMyList<any> };

    page: any;
    created() {
        let query = this.$route.query;
        this.page = { index: query.page, size: query.rows };
    }
    mounted() {
        this.query();
    }

    @Watch('$route')
    route(to, from) {
        this.query();
    }

    query() {
        let table = this.$refs.list;
        let query = this.$route.query;
        ['name', 'url', 'anyKey'].forEach(key => {
            if (query[key])
                this.$set(table.model.query, key, query[key]);
        });
        table.model.setPage({ index: query.page, size: query.rows });
        this.$refs.list.query(query);
    }

    delIds = [];
    async delClick() {
        try {
            await testApi.bookmarkDel(this.delIds);
            this.$Message.info('删除成功');
            this.delIds = [];
            this.delShow = false;
            this.$refs.list.query();
        } catch (e) {
            this.$Message.error('删除失败:' + e.message);
        }
    }
    protected render() {
        return (
            <div>
                <Modal v-model={this.detailShow} footer-hide mask-closable={false}>
                    <BookmarkDetailView detail={this.detail} on-save-success={() => {
                        this.detailShow = false;
                        this.$refs.list.query();
                    }} />
                </Modal>
                <Modal v-model={this.delShow} footer-hide>
                    <MyConfirm title='确认删除?' loading={true}
                        cancel={() => {
                            this.delShow = false;
                        }}
                        ok={async () => {
                            await this.delClick();
                        }}>
                        {`将要删除${this.delIds.length}项`}
                    </MyConfirm>
                </Modal>
                <MyList
                    ref="list"
                    current={this.page.index}
                    pageSize={this.page.size}
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
                            let tagList = params.row.tagList;
                            if (tagList && tagList.length) {
                                return MyTagModel.renderTag(tagList);
                            }
                        }
                    }, {
                        title: '名字',
                        key: 'name',
                        minWidth: 120,
                    }, {
                        title: 'url',
                        key: 'url',
                        minWidth: 200,
                        render: (h, params) => {
                            return (<a target="_blank" href={params.row.url}>{params.row.url}</a>);
                        }
                    }, {
                        title: '操作',
                        key: 'action',
                        fixed: 'right',
                        width: 120,
                        render: (h, params) => {
                            return (
                                <div class={MyTableConst.clsPrefix + "action-box"}>
                                    <a on-click={() => {
                                        this.detail = params.row;
                                        this.detailShow = true;
                                    }}>编辑</a>
                                    <a on-click={() => {
                                        this.delIds = [params.row._id];
                                        this.delShow = true;
                                    }}>删除</a>
                                </div>
                            );
                        }
                    },]}

                    queryFn={async (data) => {
                        let rs = await testApi.bookmarkQuery(data);

                        rs.rows.forEach(ele => {
                            if (!ele.tagList || !ele.tagList.length)
                                ele._disableExpand = true;
                            else
                                ele._expanded = true;
                        });
                        return rs;
                    }}

                    on-query={(model) => {
                        let q = { ...model.query };
                        this.$router.push({
                            path: this.$route.path,
                            query: {
                                ...q,
                                page: model.page.index,
                                rows: model.page.size
                            }
                        });
                    }}

                    on-add-click={() => {
                        this.detail = null;
                        this.detailShow = true;
                    }}

                    multiOperateBtnList={[{
                        text: '批量删除',
                        onClick: (selection) => {
                            this.delIds = selection.map(ele => ele._id);
                            this.delShow = true;
                        }
                    }]}
                ></MyList>
            </div>
        );
    }
}