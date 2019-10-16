import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { testApi } from '@/api';
import { myEnum, authority, dev } from '@/config';
import { routerConfig } from '@/router';
import { convert } from '@/helpers';
import { Card, Button } from '@/components/iview';
import { convClass } from '@/components/utils';
import { MyList, IMyList } from '@/components/my-list';
import { MyTag, TagType } from '@/components/my-tag';

import { ListBase, IListBase } from '../comps/list-base';
import { DetailDataType } from './article-mgt-detail';
import { VideoListItemView } from './video';
import { ContentMgtBase, ContentDataType } from './content-mgt-base';

export class VideoMgtBase extends ContentMgtBase {
    contentMgtType = myEnum.contentMgtType.文章;

    protected async auditFn(detail, pass) {
        let toStatus = pass ? myEnum.videoStatus.审核通过 : myEnum.videoStatus.审核不通过;
        let rs = await testApi.videoMgtAudit({ idList: [detail._id], status: toStatus, remark: this.notPassRemark });
        return rs;
    }

    protected canAudit(detail: ContentDataType) {
        return detail.status == myEnum.videoStatus.待审核 && this.storeUser.user.hasAuth(authority.videoMgtAudit)
    }

    toDetailUrl(preview) {
        return preview ? routerConfig.videoMgtDetail.path : routerConfig.videoMgtEdit.path;
    }

    protected async delFn() {
        await testApi.videoMgtDel({ idList: this.delIds, remark: this.delRemark });
    }

    protected isDel(detail) {
        return detail.status === myEnum.videoStatus.已删除;
    }
}


@Component
export default class VideoMgt extends VideoMgtBase implements IListBase {
    @Prop()
    queryOpt: any;

    @Prop()
    notQueryOnMounted: boolean;

    @Prop()
    notQueryOnRoute: boolean;

    @Prop()
    notQueryToRoute: boolean;

    $refs: { list: IMyList<any> };

    protected created() {
        this.statusList = myEnum.videoStatus.toArray().map(ele => {
            return {
                tag: ele.key,
                key: ele.value,
                checkable: true
            };
        });
    }

    mounted() {
        if (!this.notQueryOnMounted)
            this.query();
    }

    @Watch('$route')
    route(to, from) {
        if (!this.notQueryOnRoute)
            this.query();
    }

    query() {
        let list = this.$refs.list;
        let query = this.$route.query;
        list.setQueryByKey(query, ['user', 'title', 'anyKey']);
        let status = this.$route.query.status as string;
        let statusList = status ? status.split(',') : [];
        this.statusList.forEach(ele => {
            ele.checked = statusList.includes(ele.key.toString());
        });
        convert.Test.queryToListModel(query, list.model);
        this.$refs.list.query(query);
    }

    statusList: TagType[] = [];

    protected delSuccessHandler() {
        this.query();
    }

    protected auditSuccessHandler(detail) {
        let data = this.$refs.list.result.data;
        let idx = data.findIndex(ele => ele._id === detail._id);
        this.$refs.list.result.data.splice(idx, 1, detail);
    }

    private get multiOperateBtnList() {
        let list = [];
        if (this.storeUser.user.hasAuth(authority.authorityDel)) {
            list.push({
                text: '批量删除',
                onClick: (selection) => {
                    this.delIds = selection.map(ele => ele._id);
                    this.delShow = true;
                    this.delRemark = '';
                }
            });
        }
        return list;
    }

    protected render() {

        return (
            <div>
                {this.renderDelConfirm()}
                {this.renderNotPassConfirm()}
                <MyList
                    ref="list"
                    queryArgs={{
                        user: {
                            label: '用户',
                        },
                        title: {
                            label: '标题',
                        },
                        anyKey: {
                            label: '任意字'
                        }
                    }}
                    customQueryNode={<MyTag v-model={this.statusList} />}

                    hideQueryBtn={{
                        add: !this.storeUser.user.isLogin
                    }}

                    type="custom"
                    customRenderFn={(rs) => {
                        if (!rs.success || !rs.data.length) {
                            let msg = !rs.success ? rs.msg : '暂无数据';
                            return (
                                <Card style={{ marginTop: '5px', textAlign: 'center' }}>{msg}</Card>
                            );
                        }
                        return rs.data.map((ele: DetailDataType) => {
                            ele._disabled = !ele.canDel;
                            return (
                                <VideoListItemView value={ele} mgt
                                    selectable={!!this.multiOperateBtnList.length}
                                    on-selected-change={(val) => {
                                        ele._checked = val;
                                        this.$refs.list.selectedRows = rs.data.filter(ele => ele._checked);
                                    }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        {
                                            this.getOperate(ele).map(ele => {
                                                return (
                                                    <Button type={ele.type as any} on-click={ele.fn}>
                                                        {ele.text}
                                                    </Button>
                                                );
                                            })
                                        }
                                    </div>
                                </VideoListItemView>
                            );
                        });
                    }}

                    queryFn={async (data) => {
                        let rs = await testApi.videoMgtQuery(data);
                        return rs;
                    }}

                    on-query={(model, noClear, list: IMyList<any>) => {
                        let q = {
                            ...model.query,
                            status: this.statusList.filter(ele => ele.checked).map(ele => ele.key).join(','),
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

                    on-add-click={() => {
                        this.toDetail();
                    }}

                    on-reset-click={() => {
                        this.statusList.forEach(ele => {
                            ele.checked = false;
                        });
                    }}

                    multiOperateBtnList={this.multiOperateBtnList}
                >
                </MyList>
            </div>
        );
    }
}

export const VideoMgtView = convClass<VideoMgt>(VideoMgt);