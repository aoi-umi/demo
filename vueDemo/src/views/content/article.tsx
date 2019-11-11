import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { testApi } from '@/api';
import { myEnum, authority, dev } from '@/config';
import { convert } from '@/helpers';
import { convClass } from '@/components/utils';
import { Card, Input, } from '@/components/iview';
import { MyList, IMyList } from '@/components/my-list';

import { ListBase } from '../comps/list-base';
import { Base } from '../base';
import { DetailDataType } from './article-mgt-detail';
import { ContentListItemView } from './content';

import './article.less';

@Component
export default class Article extends ListBase {
    $refs: { list: IMyList<any> };

    anyKey = '';

    query() {
        let list = this.$refs.list;
        let query;
        if (!this.notQueryOnRoute) {
            query = this.$route.query;
            list.setQueryByKey(query, ['user', 'title']);
            this.anyKey = query.anyKey;
        } else {
            query = {};
        }
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
                    hideSearchBox

                    type="custom"
                    customRenderFn={(rs) => {
                        if (!rs.success || !rs.data.length) {
                            let msg = !rs.success ? rs.msg : '暂无数据';
                            return (
                                <Card style={{ marginTop: '5px', textAlign: 'center' }}>{msg}</Card>
                            );
                        }
                        return rs.data.map(ele => {
                            return (
                                <ArticleListItemView value={ele} />
                            );
                        });
                    }}

                    queryFn={async (data) => {
                        let rs = await testApi.articleQuery({ ...data, ...this.queryOpt });
                        return rs;
                    }}

                    on-query={(model, noClear, list: IMyList<any>) => {
                        let q = {
                            ...model.query, anyKey: this.anyKey,
                            ...convert.Test.listModelToQuery(model),
                        };
                        if (!this.notQueryToRoute) {
                            this.$router.push({
                                path: this.$route.path,
                                query: q
                            });
                        } else {
                            list.query(q);
                        }
                    }}
                >
                </MyList>
            </div >
        );
    }
}

export const ArticleView = convClass<Article>(Article);

@Component
class ArticleListItem extends Base {
    @Prop({
        required: true
    })
    value: DetailDataType;

    @Prop({
        default: false
    })
    selectable?: boolean;

    @Prop()
    mgt?: boolean;

    render() {
        return (
            <ContentListItemView
                value={this.value}
                selectable={this.selectable}
                mgt={this.mgt}
                contentType={myEnum.contentType.文章}
            >
                {this.$slots.default}
            </ContentListItemView>
        );
    }
}

export const ArticleListItemView = convClass<ArticleListItem>(ArticleListItem);