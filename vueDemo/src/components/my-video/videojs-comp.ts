import videojs, { VideoJsPlayer } from 'video.js';
import anime from 'animejs';
import 'video.js/dist/video-js.min.css';

import './videojs-comp.less';

const clsPrefix = 'vjs-danmaku-';
function getClsName(prefix, ...cls) {
    return cls.map(ele => prefix + ele).join(' ');
}
type DanmakOptions = {
    hide?: boolean;
    danmakuList?: DanmakuDataType[]
};
type DanmakuDataType = {
    msg: string,
    color?: string;
    time: number;
    isSelf?: boolean;
}
export type DanmakuPlayerOptions = videojs.PlayerOptions & {
    danmaku?: DanmakOptions
}
export class DanmakuPlayer {
    static Event = {
        danmakuSend: 'danmakuSend'.toLocaleLowerCase()
    };
    player: VideoJsPlayer;
    input: HTMLInputElement;
    sendBtn: HTMLButtonElement;
    danmakuBoard: HTMLDivElement;
    get options() {
        return this.player.options_ as DanmakuPlayerOptions;
    }
    constructor(id: any, options?: DanmakuPlayerOptions, ready?: () => void) {
        options.danmaku = {
            ...options.danmaku
        };
        this.player = videojs(id, options, ready);
        this.initView();
        this.bindEvent();
        //test
        let list = [];
        for (let i = 0; i < 10; i++) {
            list.push({
                msg: 'test' + i,
                time: i * 3,
            })
        }
        this.addDanmaku(list);
    }

    private initView() {
        let player = this.player;
        //修改control bar
        let controlBar = player.controlBar;
        let controlBarEl = controlBar.el();

        let danmakuHide = this.options.danmaku.hide;
        let danmakuBar = videojs.dom.createEl('div', {
            className: getClsName(clsPrefix, 'bar') + ' ' + (danmakuHide ? 'vjs-hidden' : ''),
        });
        let input = this.input = videojs.dom.createEl('input', {
            placeholder: '输点啥',
            className: getClsName(clsPrefix, 'input'),
        }) as any;

        let sendBtn = this.sendBtn = videojs.dom.createEl('button', {
            innerText: '发送',
            className: getClsName(clsPrefix, 'send') + ' vjs-control vjs-button',
        }) as any;
        danmakuBar.append(input, sendBtn);

        let oldBar = videojs.dom.createEl('div', {
            tabIndex: -1,
            className: getClsName(clsPrefix, 'status-bar'),
        });
        let child = controlBarEl.children;
        oldBar.append(...child);
        controlBarEl.append(danmakuBar, oldBar);

        //弹幕层
        let poster = player.el().querySelector('.vjs-poster');
        let danmakuBoard = this.danmakuBoard = videojs.dom.createEl('div', {
            tabIndex: -1,
            className: getClsName(clsPrefix, 'board'),
        }) as any;
        poster.after(danmakuBoard);
    }

    private bindEvent() {
        //快进/快退
        this.player.on('keydown', (e: KeyboardEvent) => {
            this.keydownHandler(e);
        });
        this.player.on('timeupdate', (e, ...arg) => {
            // this.timeUpdateHandler(e);
        });
        //暂停/播放
        this.player.on('play', () => {
            if (!this.player.seeking())
                this.handlePlayPause(true);
        });
        this.player.on('pause', () => {
            this.handlePlayPause(false);
        });
        this.player.on('seeking', () => {
            this.seek();
        });
        this.player.on('seeked', () => {
            if (!this.player.paused())
                this.handlePlayPause(true);
        });

        // this.player.on('waiting', () => {
        //     this.handlePlayPause(false);
        // });
        // this.player.on('playing', () => {
        //     if (!this.player.paused())
        //         this.handlePlayPause(true);
        // });

        this.input.addEventListener('keydown', (e: KeyboardEvent) => {
            e.stopPropagation();
        });

        this.input.addEventListener('keypress', (e: KeyboardEvent) => {
            if (e.keyCode === 13)
                this.sendDanmaku();
        });

        this.sendBtn.addEventListener('click', () => {
            this.sendDanmaku();
        });

        this.danmakuBoard.addEventListener('click', (e) => {
            this.handleBoardClick(e);
        });
    }

    private keydownHandler(e: KeyboardEvent) {
        let player = this.player;
        let right = 39, left = 37;
        let skipTime = 5;
        let skip = 0;
        if (e.keyCode === right) {
            skip = skipTime;
        } else if (e.keyCode === left) {
            skip = skipTime * -1;
        }

        let curr = player.currentTime();
        if (skip !== 0)
            player.currentTime(curr + skip);
    }

    private handleBoardClick(e: MouseEvent) {
        let player = this.player;
        if (!(player.controls() as any)) {
            return;
        }

        if (player.tech(true)) {
            player.tech(true).focus();
        }

        if (player.paused()) {
            player.play()
        } else {
            player.pause();
        }
    }

    private handlePlayPause(play: boolean) {
        // console.log('danmaku play', play);
        // console.log(new Error().stack);
        this.danmakuList.forEach(ele => {
            if (ele.animeInst && !ele.finished) {
                if (play) {
                    ele.animeInst.play();
                } else {
                    ele.animeInst.pause();
                }
            }
        });
    }

    private seek() {
        // console.log(e.manuallyTriggered, this.player.currentTime());
        this.danmakuList.forEach(ele => {
            delete ele.animeInst;
            if (ele.dom) {
                ele.dom.remove();
                delete ele.dom;
            }
        })
        this.updateDanmaku(true);
    }

    danmakuList: (DanmakuDataType & {
        idx?: number,
        animeInst?: anime.AnimeInstance,
        finished?: boolean,
        dom?: HTMLElement,
        refName?: string;
    })[] = [];

    private get danmaku() {
        return this.input.value;
    }
    private set danmaku(val) {
        this.input.value = val;
    }
    private get color() {
        return '';
    }

    private sendDanmaku() {
        let danmakuList = this.danmakuList;
        let player = this.player;
        let danmaku = this.danmaku && this.danmaku.trim();
        if (danmaku) {
            let idx = danmakuList.length;
            let data = { msg: danmaku, color: this.color, time: player.currentTime() };
            danmakuList.push({ idx, refName: Date.now() + '', ...data });
            this.player.trigger(DanmakuPlayer.Event.danmakuSend, data);
            this.danmaku = '';
        }
    }

    addDanmaku(danmaku: DanmakuDataType | DanmakuDataType[]) {
        let list = danmaku instanceof Array ? danmaku : [danmaku];
        this.danmakuList = [
            ...this.danmakuList,
            ...list,
        ];
    }

    private updateDanmaku(pause?: boolean) {
        let width = this.danmakuBoard.offsetWidth;
        let height = this.danmakuBoard.offsetHeight;
        let speed = 1;
        let transXReg = /\.*translateX\((.*)px\)/i;
        let { danmakuList } = this;
        danmakuList.forEach((ele, idx) => {
            let dom = ele.dom;
            //创建dom
            if (!dom) {
                ele.dom = dom = videojs.dom.createEl('div', {
                    className: getClsName(clsPrefix, 'danmaku'),
                    innerText: ele.msg,
                    style: {
                        color: ele.color
                    }
                }) as any;
                this.danmakuBoard.appendChild(dom);
            }
            //计算高度,移动动画
            if (!ele.animeInst) {
                let topLevelDict = { 0: 0 };
                danmakuList.forEach((ele2, idx2) => {
                    let dom2 = ele2.dom;
                    if (idx != idx2 && dom2) {
                        let x = Math.abs(parseFloat(transXReg.exec(dom2.style.transform)[1]));
                        if (!isNaN(x) && x < dom2.offsetWidth) {
                            let top = dom2.offsetTop;
                            if (!topLevelDict[top])
                                topLevelDict[top] = 0;
                            topLevelDict[top]++;
                            let newTop = dom2.offsetHeight + dom2.offsetTop;
                            if (newTop + dom.offsetHeight >= height)
                                newTop = 0;
                            if (!topLevelDict[newTop])
                                topLevelDict[newTop] = 0;
                        }
                    }
                });
                let danmakuWidth = width + dom.offsetWidth;
                let top = 0;
                let minLevel = -1;
                for (let key in topLevelDict) {
                    let level = topLevelDict[key];
                    if (minLevel < 0 || level < minLevel) {
                        minLevel = level;
                        top = parseFloat(key);
                    }
                }
                if (top)
                    dom.style.top = top + 'px';
                let duration = danmakuWidth * 10 / speed;
                ele.animeInst = anime({
                    targets: dom,
                    translateX: -danmakuWidth,
                    duration,
                    easing: 'linear'
                });
                if (pause) {
                    ele.animeInst.pause();
                }
                ele.animeInst.finished.then(() => {
                    ele.finished = true;
                });
            }
        });
    }
}