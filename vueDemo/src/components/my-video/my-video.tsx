import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from 'video.js';

import { MyBase } from '../MyBase';
import { convClass } from '../utils';

import './my-video.less';
import { DanmakuPlayer, DanmakuPlayerOptions } from './videojs-comp';

@Component
class MyVideo extends MyBase {
    stylePrefix = 'my-video-'
    @Prop()
    options: DanmakuPlayerOptions;

    player: VideoJsPlayer;

    $refs: { video: HTMLVideoElement; };

    mounted() {
        this.initPlayer();
    }

    initPlayer() {
        let opt = {
            ...this.getDefaultOpt(),
            ...this.options,
        };
        this.player = new DanmakuPlayer(this.$refs.video, opt).player;
        this.player.on('danmaku-send', (e, data) => {
            console.log(data);
        });
    }

    beforeDestroy() {
        videojs(this.$refs.video).dispose();
    }

    private getDefaultOpt() {
        return {
            // videojs options
            // muted: true,
            controls: true,
            language: 'en',
            playbackRates: [0.7, 1.0, 1.5, 2.0],
            aspectRatio: '16:9',
        } as VideoJsPlayerOptions;
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

    render() {
        return (
            <div class={this.getStyleName('root')}>
                <video ref="video" class={this.getStyleName('video').concat(["video-js vjs-default-skin vjs-big-play-centered"])} crossOrigin="*">
                </video>
            </div>
        );
    }
}

const MyVideoView = convClass<MyVideo>(MyVideo);
export default MyVideoView;
export interface IMyVideo extends MyVideo { }