import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { VideoJsPlayer } from 'video.js';
import Swatches from 'vue-swatches';
import moment from 'dayjs';
import "vue-swatches/dist/vue-swatches.min.css";

import { MyBase } from '../my-base';
import { convClass, Utils } from '../utils';
import { Table } from '../iview';

import './my-video.less';
import { DanmakuPlayer, DanmakuPlayerOptions, DanmakuDataType } from './videojs-comp';
import { dev } from '@/config';

@Component({
    Swatches
})
class MyVideo extends MyBase {
    stylePrefix = 'my-video-'
    @Prop()
    options: DanmakuPlayerOptions;

    player: VideoJsPlayer;
    danmakuPlayer: DanmakuPlayer;
    get getDp() {
        return this.danmakuPlayer;
    }

    $refs: { video: HTMLVideoElement; swatches: any };

    protected mounted() {
        this.initPlayer();
    }

    private danmakuList: DanmakuDataType[] = [];
    private initPlayer() {
        let opt = {
            ...this.getDefaultOpt(),
            ...this.options,
        };
        if (!opt.danmaku)
            opt.danmaku = {};
        opt.danmaku = {
            ...opt.danmaku,
            elementAfterInput: this.$refs.swatches.$el
        };

        this.danmakuPlayer = new DanmakuPlayer(this.$refs.video, opt);
        this.player = this.danmakuPlayer.player;
        this.danmakuList = this.danmakuPlayer.danmakuDataList;
    }

    protected beforeDestroy() {
        this.danmakuPlayer.dispose();
    }

    private getDefaultOpt() {
        return {
            // videojs options
            // muted: true,
            controls: true,
            language: 'en',
            // playbackRates: [0.7, 1.0, 1.5, 2.0],
            aspectRatio: '16:9',
            nativeControlsForTouch: false,
        } as DanmakuPlayerOptions;
    }

    capture() {
        let canvas = document.createElement("canvas");
        let video = this.$refs.video;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        let type = 'image/png';
        let img = canvas.toDataURL(type);
        return {
            type,
            data: img === 'data:,' ? '' : img
        };
    }

    src(src) {
        this.player.src(src);
        this.player.load();
        this.player.currentTime(0);
    }

    private color = '';

    protected render() {
        return (
            <div class={this.getStyleName('root')}>
                <div style={{ display: 'none' }}>
                    <Swatches
                        ref="swatches"
                        colors="text-advanced"
                        class={this.getStyleName('color-picker')}
                        v-model={this.color}
                        trigger-style={{
                            width: '25px', height: '25px',
                            border: '2px solid',
                        }}
                        on-input={(v) => {
                            this.getDp.color = v;
                        }}
                    />
                </div>
                <div class={this.getStyleName('video-box')}>
                    <video ref="video" class={this.getStyleName('video').concat(["video-js vjs-default-skin vjs-big-play-centered"])} crossOrigin="*"
                        x5-video-player-type="h5"
                        // x5-video-orientation="landscape"
                        x5-playsinline="" playsinline="" webkit-playsinline=""
                    />
                </div>
                <div class={this.getStyleName('danmaku-box')}>
                    <Table columns={[{
                        title: '时间',
                        key: 'pos',
                        minWidth: 80,
                        sortable: true,
                        render: (h, params) => {
                            return <span>{Utils.getDateDiff(0, params.row.pos)}</span>;
                        }
                    }, {
                        title: '内容',
                        key: 'msg',
                        minWidth: 80,
                        render: (h, params) => {
                            return <span class={this.getStyleName('danmaku-box-msg')} title={params.row.msg}>{params.row.msg}</span>;
                        }
                    }, {
                        title: '发送时间',
                        key: 'createdAt',
                        minWidth: 90,
                        sortable: true,
                        render: (h, params) => {
                            return <span>{moment(params.row.createdAt).format(dev.dateFormat)}</span>;
                        }
                    },]}
                        data={this.danmakuList} width={300}
                        on-on-row-click={(ele) => {
                            console.log(ele);
                        }}
                    />
                </div>
            </div >
        );
    }
}

const MyVideoView = convClass<MyVideo>(MyVideo);
export default MyVideoView;
export interface IMyVideo extends MyVideo { }