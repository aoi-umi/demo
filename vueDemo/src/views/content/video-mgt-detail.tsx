import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import moment from 'dayjs';

import { testApi } from '@/api';
import { myEnum, dev } from '@/config';
import { routerConfig } from '@/router';
import { FormItem, Button, Divider, Input, Icon } from '@/components/iview';
import { MyVideo, IMyVideo } from '@/components/my-video';
import { MyUpload, IMyUpload, FileDataType } from '@/components/my-upload';

import { UserAvatarView } from '../comps/user-avatar';
import { VideoMgtBase } from './video-mgt';
import { ContentDetailType, ContentDataType, ContentMgtDetail, ContentMgtDetailView, ContentLogListView } from './content-mgt-base';


import './video.less';

export type DetailDataType = ContentDataType & {
    videoIdList: string[];
};
export type DetailType = ContentDetailType<DetailDataType>;

@Component
export default class VideoMgtDetail extends VideoMgtBase {
    stylePrefix = "video-mgt-";
    $refs: { detailView: ContentMgtDetail, upload: IMyUpload, video: IMyVideo };

    private innerDetail: DetailType = this.getDetailData();
    protected getDetailData() {
        let data = this.getDefaultDetail<DetailDataType>();
        data.detail.videoIdList = [];
        data.detail.status = myEnum.videoStatus.草稿;
        data.detail.statusText = myEnum.videoStatus.getKey(data.detail.status);
        return data;
    }

    private getRules() {
        return {
            videoIdList: {
                required: true
            }
        };
    }

    private async loadDetailData() {
        let query = this.$route.query;
        let detail: DetailType;
        if (query._id) {
            this.preview = this.$route.path == routerConfig.videoMgtDetail.path;
            detail = await testApi.videoMgtDetailQuery({ _id: query._id });
            if (query.repost) {
                detail.detail._id = '';
            }
        } else {
            detail = this.getDetailData() as any;
        }
        this.innerDetail = detail;
        return detail;
    }

    private async beforeValidFn(detail: DetailDataType) {
        await this.operateHandler('上传视频', async () => {
            let upload = this.$refs.upload;
            let err = await upload.upload();
            if (err.length) {
                throw new Error(err.join(','));
            }
            let file = upload.fileList[0];
            if (file && file.uploadRes) {
                detail.videoIdList = [file.uploadRes];
            }
        });
    }

    private async saveFn(detail: DetailDataType, submit) {
        let { user, ...restDetail } = detail;
        let rs = await testApi.videoMgtSave({
            ...restDetail,
            submit
        });
        return rs;
    }

    protected renderHeader(detail: ContentDataType) {
        return (
            <div>
                <UserAvatarView user={detail.user} />
                {[
                    '状态: ' + detail.statusText,
                    '创建于: ' + moment(detail.createdAt).format(dev.dateFormat),
                    detail.publishAt && ('发布于:' + moment(detail.publishAt).format(dev.dateFormat)),
                ].map(ele => {
                    return (<span class="not-important" style={{ marginLeft: '5px' }}>{ele}</span>);
                })}
            </div>
        );
    }

    protected renderLog() {
        let { log } = this.innerDetail;
        return (
            <ContentLogListView log={log} />
        );
    }

    renderPreview() {
        let { detail } = this.innerDetail;
        let operate = this.getOperate(detail, { noPreview: true, isDetail: true });
        return (
            <div>
                <h1>{detail.title}</h1>
                <br />
                {this.renderHeader(detail)}
                <br />

                {operate.length > 0 && <Divider size='small' />}
                <div>
                    {operate.map(ele => {
                        return (
                            <Button type={ele.type as any} on-click={ele.fn}>
                                {ele.text}
                            </Button>
                        );
                    })}
                </div>
                {this.renderLog()}
                {this.renderDelConfirm()}
                {this.renderNotPassConfirm()}
            </div>
        );
    }


    render() {
        let videoSize = 20;
        return (
            <ContentMgtDetailView ref="detailView"
                preview={this.preview}
                loadDetailData={this.loadDetailData}
                getRules={this.getRules}
                beforeValidFn={this.beforeValidFn}
                saveFn={this.saveFn}
                saveSuccessFn={() => {
                    this.toList();
                }}
                renderPreviewFn={this.renderPreview}
            >
                <FormItem label="视频" prop="videoIdList">
                    <MyUpload ref='upload' width={videoSize * 16} height={videoSize * 9}
                        headers={testApi.defaultHeaders}
                        uploadUrl={testApi.videoUploadUrl}
                        maxSize={10240}
                        format={['mp4']}
                        successHandler={(res, file) => {
                            let rs = testApi.uplodaHandler(res);
                            file.url = rs.url;
                            return rs.fileId;
                        }}
                        uploadIconType={FileDataType.视频}
                        showVideoCrop
                        on-video-crop={(data, item) => {
                            this.$refs.detailView.$refs.cover.setFile({
                                data,
                                file: item.file,
                                fileType: FileDataType.图片
                            });
                        }}
                    >
                    </MyUpload>
                </FormItem>
            </ContentMgtDetailView>
        )
    }
}
