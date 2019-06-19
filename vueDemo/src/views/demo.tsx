import { Component, Vue, Watch } from 'vue-property-decorator';
import anime from 'animejs';

import { Input, Card, Button } from '@/components/iview';
import { MyList } from '@/components/my-list';


@Component
export default class App extends Vue {
    public value = '';
    public msg = '';
    public list: { test: string }[] = [];
    public get valueLength() {
        return this.value.length;
    }


    danmaku = '';
    contents: {
        idx: number,
        msg: string,
        animeInst?: anime.AnimeInstance,
        finished?: boolean,
        dom?: HTMLElement,
        refName?: string;
    }[] = [];
    $refs: { board: HTMLElement; }

    public created() {
        console.log('created.');
        this.setList();
    }

    public handleClick() {
        console.log('click');
        this.setList();
    }

    setList() {
        this.list = [{
            test: '1'
        }, {
            test: '2'
        }, {
            test: '3'
        }, {
            test: '4'
        }, {
            test: '5'
        }];
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
                    let content = contents[idx];
                    if (content)
                        content.finished = true;
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
            contents.push({ idx, msg: danmaku, refName: Date.now() + '' });
            this.danmaku = '';
        }
    }

    protected render() {
        let contents = this.contents;
        return (
            <div>
                <MyList columns={[{ title: 'test', key: 'test' }]} data={this.list}></MyList>
                <MyList data={this.list} type="custom" hideSearchBox customRenderFn={(rs) => {
                    if (!rs.success || !rs.total) {
                        return <Card style={{ marginTop: '10px' }}>{rs.msg}</Card>;
                    } else {
                        return rs.data.map(ele => {
                            return <Card style={{ marginTop: '10px' }}>{ele.test}</Card>;
                        });
                    }
                }}></MyList>

                <div>
                    <Input v-model={this.danmaku} on-on-keypress={(e) => {
                        if (e.charCode == 13) {
                            this.sendDanmaku();
                        }
                    }} />
                    <Button on-click={this.sendDanmaku}>danmaku</Button>
                    <Button on-click={() => { this.contents = []; }}>clear anime</Button>
                </div>
                <div ref='board' style={{
                    height: '500px', width: '500px', background: '#f7f7f7', overflow: 'hidden', position: 'relative',
                    fontSize: '35px', color: 'white',
                    textStroke: '0.5px #000',
                }}>
                    {
                        contents.map(ele => {
                            let idx = ele.idx;
                            return (
                                <div key={idx} ref={ele.refName} style={{ display: 'inline-block', position: 'absolute', left: '100%', whiteSpace: 'nowrap' }}>
                                    {ele.msg}
                                </div>);
                        })
                    }
                </div>
            </div>
        );
    }
}
