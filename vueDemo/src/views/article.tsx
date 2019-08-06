import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import moment from 'moment';
import { testApi } from '@/api';
import { myEnum, authority, dev } from '@/config';
import { Card, Input, Row, Col } from '@/components/iview';
import { MyList, IMyList, Const as MyTableConst } from '@/components/my-list';
import { MyImg } from '@/components/my-img';
import { convert } from '@/helpers';
import { DetailDataType } from './article-mgt-detail';

@Component
export default class Article extends Vue {
    $refs: { list: IMyList<any> };

    page: any;
    anyKey = '';
    protected created() {
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
        let list = this.$refs.list;
        let query = this.$route.query;
        list.setQueryByKey(query, ['user', 'title', 'anyKey']);
        convert.Test.queryToListModel(query, list.model);
        this.$refs.list.query(query);
    }

    protected delSuccessHandler() {
        this.$refs.list.query();
    }

    protected render() {
        return (
            <div>
                <Input v-model={this.anyKey} search on-on-search={() => {
                    this.$refs.list.handleQuery({ resetPage: true });
                }} />
                <MyList
                    ref="list"
                    current={this.page.index}
                    pageSize={this.page.size}
                    hideSearchBox

                    type="custom"
                    customRenderFn={(rs) => {
                        if (!rs.success || !rs.data.length) {
                            let msg = !rs.success ? rs.msg : '暂无数据';
                            return (
                                <Card style={{ marginTop: '5px', textAlign: 'center' }}>{msg}</Card>
                            );
                        }
                        return rs.data.map((ele: DetailDataType) => {
                            return (
                                <div on-click={() => {
                                    this.$router.push({
                                        path: dev.routeConfig.articleDetail.path,
                                        query: { _id: ele._id }
                                    });
                                }}>
                                    <Card style={{ marginTop: '5px', maxHeight: '150px', overflowY: 'hidden', cursor: 'pointer' }}>
                                        <Row>
                                            <Col xs={4}><MyImg class="cover" src={ele.coverUrl} /></Col>
                                            <Col xs={20}>
                                                <h3 class="article-list-title">{ele.title}</h3>
                                                <label>作者: {ele.user.nickname}</label>
                                                <p domPropsInnerHTML={ele.content}></p>
                                            </Col>
                                        </Row>
                                    </Card>
                                </div>
                            );
                        });
                    }}

                    queryFn={async (data) => {
                        let rs = await testApi.articleQuery(data);
                        return rs;
                    }}

                    on-query={(model) => {
                        let q = { ...model.query, anyKey: this.anyKey };
                        this.$router.push({
                            path: this.$route.path,
                            query: {
                                ...q,
                                ...convert.Test.listModelToQuery(model),
                            }
                        });
                    }}
                >
                </MyList>
            </div>
        );
    }
}