import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import videojs from 'video.js';
import 'video.js/dist/video-js.min.css';

import { MyBase } from '../MyBase';
import { convClass } from '../utils';


@Component
class MyVideo extends MyBase {
    @Prop()
    options: any;

    player: any;

    $refs: { video: HTMLVideoElement; };

    mounted() {
        let opt = {
            ...this.getDefaultOpt(),
            ...this.options,
        };
        this.player = videojs(this.$refs.video, opt);
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
        };
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
            <video ref="video" class="video-js vjs-default-skin" crossOrigin="*" style={{
                width: 'inherit',
                height: 'inherit',
            }}>
            </video>
        );
    }
}

const MyVideoView = convClass<MyVideo>(MyVideo);
export default MyVideoView;
export interface IMyVideo extends MyVideo { }