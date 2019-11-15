import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { testApi } from '@/api';
import { myEnum, authority, dev } from '@/config';
import { convert } from '@/helpers';
import { convClass } from '@/components/utils';
import { Card, Input } from '@/components/iview';
import { MyList, IMyList } from '@/components/my-list';

import { Base } from '../base';
import { DetailDataType } from './article-mgt-detail';
import { ContentListItemView } from './content';

import './video.less';

@Component
export default class Video extends Base {
    $refs: { list: IMyList<any> };

    anyKey = '';

    mounted() {
        this.query();
    }

    @Watch('$route')
    route(to, from) {
        this.query();
    }

    query() {
        let list = this.$refs.list;
        let query: any = this.$route.query;
        list.setQueryByKey(query, ['user', 'title']);
        this.anyKey = query.anyKey;
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
                                <VideoListItemView value={ele} />
                            );
                        });
                    }}

                    queryFn={async (data) => {
                        let rs = await testApi.videoQuery(data);
                        return rs;
                    }}

                    on-query={(model) => {
                        this.$router.push({
                            path: this.$route.path,
                            query: {
                                ...model.query,
                                anyKey: this.anyKey,
                                ...convert.Test.listModelToQuery(model),
                            }
                        });
                    }}
                >
                </MyList>
            </div >
        );
    }
}


@Component
class VideoListItem extends Base {
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
                contentType={myEnum.contentType.视频}
                on-selected-change={(checked) => {
                    this.$emit('selected-change', checked);
                }}
            >
                {this.$slots.default}
            </ContentListItemView>
        );
    }
}

export const VideoListItemView = convClass<VideoListItem>(VideoListItem);