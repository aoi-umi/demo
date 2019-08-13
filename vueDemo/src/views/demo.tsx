import { Component, Vue, Watch } from 'vue-property-decorator';
import anime from 'animejs';
import 'echarts/lib/chart/line';
import * as echarts from 'echarts/lib/echarts';

import 'video.js/dist/video-js.css';
import 'vue-video-player/src/custom-theme.css';
import { videoPlayer } from 'vue-video-player';

import { Input, Card, Button, ColorPicker, Row, Col, Checkbox } from '@/components/iview';
import { MyList, IMyList } from '@/components/my-list';
import { testSocket, testApi } from '@/api';
import { Base } from './base';

@Component({
    components: {
        videoPlayer
    }
})
export default class App extends Base {
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
    $refs: { board: HTMLElement; list: IMyList<any>; echart: HTMLDivElement };
    richText = '';
    chart: echarts.ECharts;
    chartAddData = '';

    public created() {
        this.setList();
        testSocket.bindDanmakuRecv(this.recvDanmaku);
    }

    mounted() {
        this.$refs.list.query();
        this.chart = echarts.init(this.$refs.echart);
        this.setECharts();
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

    fail = false;
    protected render() {
        let contents = this.contents;
        return (
            <div>
                <div style={{
                    width: '500px',
                    display: 'inline-block',
                }}>
                    <div style={{
                        position: 'relative',
                        height: '400px',
                        width: '100%',
                        background: '#000',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <video-player
                            class="video-player vjs-custom-skin"
                            options={
                                {
                                    // videojs options
                                    muted: true,
                                    language: 'en',
                                    playbackRates: [0.7, 1.0, 1.5, 2.0],
                                    sources: [{
                                        type: "video/mp4",
                                        src: "http://localhost:8000/devMgt/video/detail?_id=test"
                                    }],
                                    // poster: "/static/images/author.jpg",
                                    aspectRatio: '16:9',
                                }
                            }
                            style={{
                                width: '100%'
                            }}
                        />
                        {/* <video style={{ width: '100%' }} src="http://localhost:8000/devMgt/video/detail?_id=test" controls="conrtols"/> */}
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
                            <Col span={21}>
                                <Input v-model={this.danmaku} on-on-keypress={(e) => {
                                    if (this.isPressEnter(e)) {
                                        this.sendDanmaku();
                                    }
                                }} search enter-button="danmaku" on-on-search={this.sendDanmaku} />
                            </Col>
                            <Col span={3}>
                                <ColorPicker v-model={this.color} />
                            </Col>
                        </Row>
                        <Button on-click={() => { this.contents = []; }}>clear anime</Button>
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
                            return <Card style={{ marginTop: '10px' }}>{ele.test}</Card>;
                        });
                        return list;
                    }}></MyList>
            </div >
        );
    }
}
