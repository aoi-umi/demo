import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import * as iview from 'iview';
import { testApi } from '@/api';
import { convert } from '@/helpers';
import { convClass } from '@/components/utils';
import { Tag, Modal, Input, Row, Col, Form, FormItem, Button } from '@/components/iview';
import { MyList, IMyList, Const as MyListConst, OnSortChangeOptions, MyListModel } from '@/components/my-list';
import { MyTagModel, MyTag } from '@/components/my-tag';
import { MyConfirm } from '@/components/my-confirm';
import { Base } from './base';

type DetailDataType = {
    _id?: string;
    name?: string;
    url?: string;
    tagList?: string[];
};
@Component
class BookmarkDetail extends Base {
    @Prop()
    detail: any;

    tag = '';
    tagModel = new MyTagModel();

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
        this.tagModel.initTag(this.innerDetail.tagList);
    }

    private rules = {
        name: [
            { required: true, trigger: 'blur' }
        ],
        url: [
            { required: true, trigger: 'blur' }
        ],
    };

    $refs: { formVaild: iview.Form };

    addTag() {
        let tag = this.tag && this.tag.trim();
        if (tag) {
            this.tagModel.addTag(tag);
            this.tag = '';
        }
    }

    saving = false;
    async handleSave() {
        await this.operateHandler('保存', async () => {
            this.saving = true;
            let detail = this.innerDetail;
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
                <h3>{detail._id ? '修改' : '新增'}</h3>
                <br />
                <Form ref="formVaild" label-position="top" props={{ model: detail }} rules={this.rules}>
                    <FormItem label="名字" prop="name">
                        <Input v-model={detail.name} />
                    </FormItem>
                    <FormItem label="url" prop="url">
                        <Input v-model={detail.url} />
                    </FormItem>
                    <FormItem label="标签" >
                        <MyTag value={this.tagModel.tagList} />
                        <br />
                        <Row gutter={10}>
                            <Col span={12}>
                                <Input placeholder="回车或点击按钮添加" v-model={this.tag} on-on-enter={this.addTag} />
                            </Col>
                            <Col span={4}><Button on-click={this.addTag}>添加</Button></Col>
                        </Row>
                    </FormItem>
                    <FormItem>
                        <Button type="primary" on-click={() => {
                            this.handleSave();
                        }} loading={this.saving}>保存</Button>
                    </FormItem>
                </Form>
            </div >
        );
    }
}

const BookmarkDetailView = convClass<BookmarkDetail>(BookmarkDetail);


@Component
export default class Bookmark extends Base {
    detailShow = false;
    delShow = false;
    detail: any;
    $refs: { list: IMyList<any> };

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
        list.setQueryByKey(query, ['name', 'url', 'anyKey']);
        convert.Test.queryToListModel(query, list.model);
        this.$refs.list.query(query);
    }

    delIds = [];
    async delClick() {
        await this.operateHandler('删除', async () => {
            await testApi.bookmarkDel(this.delIds);
            this.delIds = [];
            this.delShow = false;
            this.query();
        });
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
                        将要删除{this.delIds.length}项
                    </MyConfirm>
                </Modal>
                <MyList
                    ref="list"
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
                            return <MyTag value={tagList} />;
                        }
                    }, {
                        title: '名字',
                        key: 'name',
                        sortable: 'custom',
                        minWidth: 120,
                    }, {
                        title: 'url',
                        key: 'url',
                        sortable: true,
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
                                <div class={MyListConst.clsActBox}>
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

                    on-query={(model: MyListModel) => {
                        let q = { ...model.query };
                        this.$router.push({
                            path: this.$route.path,
                            query: {
                                ...q,
                                ...convert.Test.listModelToQuery(model)
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