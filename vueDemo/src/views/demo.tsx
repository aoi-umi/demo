import { Component, Vue, Watch } from 'vue-property-decorator';
import anime from 'animejs';
import 'echarts/lib/chart/line';
import * as echarts from 'echarts/lib/echarts';

import * as  QRCode from 'qrcode';

import videojs from 'video.js';
import 'video.js/dist/video-js.min.css';

import { Input, Card, Button, ColorPicker, Row, Col, Checkbox } from '@/components/iview';
import { MyList, IMyList } from '@/components/my-list';
import { MyUpload, IMyUpload } from '@/components/my-upload';
import { testSocket, testApi } from '@/api';
import { Base } from './base';
import './demo.less';


@Component
export default class App extends Base {
    protected stylePrefix = 'demo-';
    public value = '';
    public msg = '';
    public list: { test: string }[] = [];
    color = 'white';
    public get valueLength() {
        return this.value.length;
    }


    danmaku = '';
    contents: {
        idx: number,
        msg: string,
        color?: string;
        animeInst?: anime.AnimeInstance,
        finished?: boolean,
        dom?: HTMLElement,
        refName?: string;
    }[] = [];
    $refs: {
        board: HTMLElement; list: IMyList<any>; echart: HTMLDivElement; canvas: HTMLDivElement;
        upload: IMyUpload; video: HTMLVideoElement; videoCover: any;
    };
    richText = '';
    chart: echarts.ECharts;
    chartAddData = '';
    player: any;

    public created() {
        this.setList();
        testSocket.bindDanmakuRecv(this.recvDanmaku);
    }

    videoIdText = '';
    videoId = '5d9eeeb0f8b93d22548dd6cc';

    videoOpt = {
        // videojs options
        muted: true,
        controls: true,
        language: 'en',
        playbackRates: [0.7, 1.0, 1.5, 2.0],
        sources: [{
            type: "video/mp4",
            src: testApi.getVideoUrl(this.videoId)
        }],
        poster: "http://vjs.zencdn.net/v/oceans.png",
        aspectRatio: '16:9',
    }

    mounted() {
        this.$refs.list.query();
        this.chart = echarts.init(this.$refs.echart);
        this.setECharts();
        this.qrcode();
        this.player = videojs(this.$refs.video, this.videoOpt);
    }

    beforeDestroy() {
        videojs(this.$refs.video).dispose();
    }

    async qrcode() {
        await QRCode.toCanvas(this.$refs.canvas, 'qrcode').catch(e => {
            console.error(e);
        });
    }

    setECharts() {
        const optionData: any = {
            xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: [820, 932, 901, 934, 1290, 1330, 1320],
                type: 'line',
                // smooth: true
            }]
        };

        this.chart.setOption(optionData);
    }

    public handleClick() {
        this.setList();
    }

    setList(start = 0, size = 10) {
        this.list = new Array(size).fill('').map((e, i) => {
            return {
                test: i + start + 1 + '',
            };
        });
    }

    @Watch('value')
    protected valueWatch(newV: any, oldV: any) {
        this.msg = `new value：${newV}`;
    }
    updated() {
        this.updateDanmaku();
    }
    updateDanmaku() {
        let width = this.$refs.board.offsetWidth;
        let height = this.$refs.board.offsetHeight;
        let v = 1;
        let transXReg = /\.*translateX\((.*)px\)/i;
        let { contents } = this;
        contents.forEach((ele, idx) => {
            let dom = this.$refs[ele.refName];//ele.dom;
            if (dom && !ele.animeInst) {
                let topLevelDict = { 0: 0 };
                contents.forEach((cont, idx2) => {
                    let d = this.$refs[cont.refName];//cont.dom;
                    if (idx != idx2 && d) {
                        let x = Math.abs(parseFloat(transXReg.exec(d.style.transform)[1]));
                        if (!isNaN(x) && x < d.offsetWidth) {
                            let top = d.offsetTop;
                            if (!topLevelDict[top])
                                topLevelDict[top] = 0;
                            topLevelDict[top]++;
                            let newTop = d.offsetHeight + d.offsetTop;
                            if (newTop + dom.offsetHeight >= height)
                                newTop = 0;
                            if (!topLevelDict[newTop])
                                topLevelDict[newTop] = 0;
                        }
                    }
                });
                let s = width + dom.offsetWidth;
                let top = 0;
                let minLevel = -1;
                // console.log(topLevelDict);
                for (let key in topLevelDict) {
                    let level = topLevelDict[key];
                    if (minLevel < 0 || level < minLevel) {
                        minLevel = level;
                        top = parseFloat(key);
                    }
                }
                if (top)
                    dom.style.top = top + 'px';
                let duration = s * 10 / v;
                ele.animeInst = anime({
                    targets: dom,
                    translateX: -s,
                    duration,
                    easing: 'linear'
                });
                ele.animeInst.finished.then(() => {
                    ele.finished = true;
                });
            }
        });
        //移除已结束
        // for (let idx = contents.length - 1; idx >= 0; idx--) {
        //     let ele = contents[idx];
        //     if (ele.finished)
        //         contents.splice(idx, 1);
        // }
    }

    sendDanmaku() {
        let contents = this.contents;
        let danmaku = this.danmaku && this.danmaku.trim();
        if (danmaku) {
            let idx = contents.length;
            let data = { msg: danmaku, color: this.color };
            contents.push({ idx, refName: Date.now() + '', ...data });
            testSocket.danmakuSend(data);
            this.danmaku = '';
        }
    }

    recvDanmaku(data) {
        let contents = this.contents;
        let idx = contents.length;
        contents.push({ idx, refName: Date.now() + '', ...data });
    }

    captureImage() {
        let canvas = document.createElement("canvas");
        let video = this.$refs.video;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/png');
    }

    fail = false;
    protected render() {
        let contents = this.contents;

        return (
            <div>
                <div class={this.getStyleName('danmaku-main')} style={{
                    width: '500px',
                    display: 'inline-block',
                }}>
                    <Input v-model={this.videoIdText} search enter-button="确认"
                        on-on-search={() => {
                            this.videoId = this.videoIdText;
                            let url = testApi.getVideoUrl(this.videoId) || 'http://vjs.zencdn.net/v/oceans.mp4';
                            this.player.src({
                                type: "video/mp4",
                                src: url
                            });
                            this.player.load();
                            this.player.currentTime(0);
                            this.player.play();
                        }} />
                    <div style={{
                        position: 'relative',
                        height: '400px',
                        width: '100%',
                        background: '#000',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <video ref="video" class="video-js vjs-default-skin" crossOrigin="*" style={{
                            width: 'inherit',
                            height: 'inherit',
                        }}>
                        </video>
                        <div ref='board' style={{
                            overflow: 'hidden', position: 'absolute',
                            fontSize: '30px', color: 'white',
                            textStroke: '0.5px #000',
                            left: 0, right: 0,
                            top: 0, bottom: 0,
                            pointerEvents: 'none'
                        }}>
                            {
                                contents.map(ele => {
                                    let idx = ele.idx;
                                    return (
                                        <div key={idx} ref={ele.refName} style={{ display: 'inline-block', position: 'absolute', left: '100%', whiteSpace: 'nowrap', color: ele.color }}>
                                            {ele.msg}
                                        </div>);
                                })
                            }
                        </div>
                    </div>
                    <div>
                        <Row >
                            <Col span={24}>
                                <div style={{ display: 'flex' }}>
                                    <Input class="input" v-model={this.danmaku} on-on-keypress={(e) => {
                                        if (this.isPressEnter(e)) {
                                            this.sendDanmaku();
                                        }
                                    }} style={{ flexGrow: 1 }} />
                                    <ColorPicker class="color-picker" v-model={this.color} />
                                    <Button class="send" type="primary" on-click={this.sendDanmaku}>danmaku</Button>
                                </div>
                            </Col>
                        </Row>
                        <Button on-click={() => { this.contents = []; }}>clear anime</Button>
                        <Button on-click={() => {
                            this.$refs.videoCover.src = this.captureImage();
                        }}>截取</Button>
                        <img width="160" height="90" ref='videoCover' />
                    </div>
                </div>
                <div style={{
                    display: 'inline-block',
                    width: '600px',
                    verticalAlign: 'top',
                }}>
                    <quill-editor v-model={this.richText} options={{
                        // theme: 'snow',
                        // modules: {
                        //     toolbar: ['bold', 'italic', 'underline', 'strike']
                        // },
                        placeholder: '输点啥。。。',
                    }}></quill-editor>
                    <Button on-click={() => {
                        console.log(this.richText);
                    }}>log</Button>
                    <div ref="echart" style={{ height: '300px', width: '500px' }}></div>
                    <Input v-model={this.chartAddData} search enter-button="添加" on-on-search={() => {
                        let num = parseFloat(this.chartAddData);
                        if (!isNaN(num)) {
                            let opt = this.chart.getOption();
                            let data: number[] = (opt.series[0] as any).data;
                            data.shift();
                            data.push(num);
                            this.chart.setOption(opt);
                            this.chartAddData = '';
                        }
                    }} />
                </div>
                <canvas ref="canvas"></canvas>
                <MyUpload ref='upload' width={100} height={100}
                    headers={testApi.defaultHeaders}
                    uploadUrl={testApi.videoUploadUrl} maxSize={10240} />
                <Button on-click={() => {
                    this.$refs.upload.upload();
                }}>upload</Button>

                <MyList ref="list" type="custom" infiniteScroll
                    customQueryNode={
                        <label>
                            <Checkbox v-model={this.fail} />失败
                        </label>
                    }
                    on-query={(model, noClear) => {
                        let q = { ...model.query };
                        this.$refs.list.query(q, noClear);
                    }}

                    queryFn={() => {
                        let page = this.$refs.list.model.page;
                        let total = 25;
                        let start = (page.index - 1) * page.size;

                        let size = start + page.size > total ? total - start : page.size;
                        this.setList((page.index - 1) * page.size, size);
                        return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                if (this.fail)
                                    return reject(new Error('test'));
                                resolve({
                                    rows: this.list,
                                    total
                                });
                            }, 2000);
                        });
                    }}

                    customRenderFn={(rs) => {
                        let list = rs.data.map(ele => {
                            return <Card style={{ marginBottom: '10px' }}>{ele.test}</Card>;
                        });
                        return list;
                    }}></MyList>
            </div >
        );
    }
}
