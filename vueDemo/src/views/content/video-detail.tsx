import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import moment from 'dayjs';

import { testApi } from '@/api';
import { myEnum, dev } from '@/config';
import { Divider, Spin } from '@/components/iview';
import { MyLoad, IMyLoad } from '@/components/my-load';
import { MyVideo } from '@/components/my-video';
import { FileType, FileDataType } from '@/components/my-upload';

import { UserAvatarView } from '../comps/user-avatar';
import { Base } from '../base';
import { DetailType, DetailDataType } from './video-mgt-detail';
import { CommentView } from './comment';

import './video.less';

@Component
export default class VideoDetail extends Base {
    stylePrefix = 'video-';
    $refs: { loadView: IMyLoad };
    videoList: FileType[] = [];

    mounted() {
        this.$refs.loadView.loadData();
    }

    renderHeader(detail: DetailDataType) {
        return (
            <div>
                <UserAvatarView user={detail.user} />
                {[
                    '发布于: ' + moment(detail.publishAt).format(dev.dateFormat),
                ].map(ele => {
                    return (<span class="not-important" style={{ marginLeft: '5px' }}>{ele}</span>);
                })}
            </div>
        );
    }

    render() {
        return (
            <MyLoad
                ref="loadView"
                loadFn={async () => {
                    let query = this.$route.query;
                    let rs = await testApi.videoDetailQuery({ _id: query._id });
                    this.videoList = rs.detail.videoList.map(ele => {
                        return { url: ele.url, fileType: FileDataType.视频, originFileType: ele.contentType };
                    });
                    return rs;
                }}
                renderFn={(t: DetailType) => {
                    let { detail } = t;
                    return (
                        <div>
                            <h1>{detail.title}</h1>
                            <br />
                            {this.renderHeader(detail)}
                            <br />
                            <div class={this.getStyleName('video-box')}>
                                <div class={this.getStyleName('video')}>
                                    <MyVideo options={{
                                        sources: this.videoList.map(ele => {
                                            return {
                                                src: ele.url,
                                                type: ele.originFileType,
                                            }
                                        })
                                    }} />
                                </div>
                            </div>
                            <Divider size='small' />
                            {detail._id && <CommentView ownerId={detail._id} ownUserId={detail.userId} type={myEnum.contentType.视频} />}
                        </div>
                    );
                }} />
        );
    }
}
