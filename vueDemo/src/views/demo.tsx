import { Component, Vue, Watch } from 'vue-property-decorator';
import 'echarts/lib/chart/line';
import * as echarts from 'echarts/lib/echarts';
import * as  QRCode from 'qrcode';
import { VideoJsPlayer } from 'video.js';

import { testSocket, testApi } from '@/api';
import { Input, Card, Button, Checkbox } from '@/components/iview';
import { MyList, IMyList } from '@/components/my-list';
import { MyUpload, IMyUpload } from '@/components/my-upload';
import { MyVideo, IMyVideo } from '@/components/my-video';
import { MyEditor } from '@/components/my-editor';

import { Base } from './base';
import './demo.less';


@Component({})
export default class App extends Base {
    protected stylePrefix = 'demo-';
    public value = '';
    public msg = '';
    public list: { test: string }[] = [];
    color = 'white';
    public get valueLength() {
        return this.value.length;
    }

    $refs: {
        board: HTMLElement; list: IMyList<any>; echart: HTMLDivElement; canvas: HTMLDivElement;
        upload: IMyUpload; video: IMyVideo; videoCover: any;
    };
    richText = '';
    chart: echarts.ECharts;
    chartAddData = '';
    player: VideoJsPlayer;

    public created() {
        this.setList();
        testSocket.bindDanmakuRecv(this.recvDanmaku);
        let query: any = this.$route.query;
        if (query.videoId)
            this.videoId =
                this.videoIdText =
                query.videoId as any;
    }

    videoIdText = '';
    videoId = '5da6efd5929f9b23549931ef';

    mounted() {
        this.$refs.list.query();
        this.chart = echarts.init(this.$refs.echart);
        this.setECharts();
        this.qrcode();
        this.player = this.$refs.video.player;
        // this.player.on(DanmakuPlayer.Event.danmakuSend, (e, data) => {
        //     console.log(data);
        // });
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

    recvDanmaku(data) {
        this.$refs.video.danmakuPlayer.danmakuPush(data);
    }

    captureImage() {
        return this.$refs.video.capture().data;
    }

    fail = false;
    protected render() {
        let danmakuList = [];
        //test
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 3; j++) {
                danmakuList.push({
                    msg: 'test' + (i * 3 + j),
                    pos: i * 1000 + j * 500,
                });
            }
        }
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
                    <MyVideo ref="video" options={{
                        poster: '//localhost:8000/devMgt/img?_id=5da818d6433fe2209054c290',
                        sources: [{
                            type: "video/mp4",
                            src: testApi.getVideoUrl(this.videoId)
                        }],
                        danmaku: {
                            danmakuList,
                            // sendFn: async (data) => {
                            //     let rs = await this.operateHandler('发送弹幕', async () => {
                            //         data.videoId = this.videoId;
                            //         await testApi.danmakuSubmit(data);
                            //     }, { noSuccessHandler: true });
                            //     return rs.success;
                            // }
                        }
                    }} />
                </div>
                <div style={{
                    display: 'inline-block',
                }}>
                    <Button on-click={() => {
                        this.$refs.videoCover.src = this.captureImage();
                    }}>截取</Button>
                    <img width="160" height="90" ref='videoCover' />
                </div>
                <div style={{
                    display: 'inline-block',
                    width: '600px',
                    verticalAlign: 'top',
                }}>
                    <MyEditor v-model={this.richText} placeholder='输点啥。。。' />
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
                    uploadUrl={testApi.videoUploadUrl} maxSize={10240} successHandler={(res, file) => {
                        testApi.uplodaHandler(res);
                    }} />
                <Button on-click={() => {
                    this.operateHandler('上传', async () => {
                        let err = await this.$refs.upload.upload();
                        if (err.length) {
                            throw new Error(err.join(','));
                        }
                    });
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
