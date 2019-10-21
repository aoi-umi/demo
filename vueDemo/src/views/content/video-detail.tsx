import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import moment from 'dayjs';

import { testApi, testSocket } from '@/api';
import { myEnum, dev } from '@/config';
import { convClass } from '@/components/utils';
import { Divider, Spin } from '@/components/iview';
import { MyLoad, IMyLoad } from '@/components/my-load';
import { MyVideo, IMyVideo } from '@/components/my-video';
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

    mounted() {
        this.$refs.loadView.loadData();
    }

    render() {
        return (
            <MyLoad
                ref="loadView"
                loadFn={async () => {
                    let query = this.$route.query;
                    let rs = await testApi.videoDetailQuery({ _id: query._id });
                    return rs;
                }}
                renderFn={(t: DetailType) => {
                    let { detail } = t;
                    return (
                        <div>
                            <VideoDetailMainView data={detail} />
                            <Divider size='small' />
                            <CommentView ownerId={detail._id} ownUserId={detail.userId} type={myEnum.contentType.视频} />
                        </div>
                    );
                }} />
        );
    }
}

@Component
class VideoDetailMain extends Base {
    stylePrefix = 'video-';

    @Prop({
        required: true
    })
    data: DetailDataType;

    $refs: { video: IMyVideo };

    videoId: string;

    created() {
        this.videoList = this.data.videoList.map(ele => {
            return { url: ele.url, fileType: FileDataType.视频, originFileType: ele.contentType };
        });
        this.videoId = this.data.videoIdList[0];
        testSocket.danmakuConnect({ videoId: this.videoId });
        testSocket.bindDanmakuRecv(this.recvDanmaku);
    }

    mounted() {
        this.loadDanmaku();
    }

    destroyed() {
        testSocket.danmakuDisconnect({ videoId: this.videoId });
    }

    videoList: FileType[] = [];

    async loadDanmaku() {
        let rs = await testApi.danmakuQuery({ videoId: this.videoId });
        this.$refs.video.danmakuPlayer.danmakuPush(rs.rows);
    }

    recvDanmaku(data) {
        if (data.videoId == this.videoId)
            this.$refs.video.danmakuPlayer.danmakuPush(data);
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
        let detail = this.data;
        return (
            <div>
                <h1>{detail.title}</h1>
                <br />
                {this.renderHeader(detail)}
                <br />
                <div class={this.getStyleName('video-box')}>
                    <div class={this.getStyleName('video')}>
                        <MyVideo
                            ref='video'
                            options={{
                                sources: this.videoList.map(ele => {
                                    return {
                                        src: ele.url,
                                        type: ele.originFileType,
                                    }
                                }),
                                poster: detail.coverUrl,
                                danmaku: {
                                    sendFn: async (data) => {
                                        let rs = await this.operateHandler('发送弹幕', async () => {
                                            data.videoId = this.videoId;
                                            await testApi.danmakuSubmit(data);
                                        }, { noSuccessHandler: true });
                                        return rs.success;
                                    }
                                }
                            }} />
                    </div>
                </div>
            </div>
        )
    }
}

export const VideoDetailMainView = convClass<VideoDetailMain>(VideoDetailMain);