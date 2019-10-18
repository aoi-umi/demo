import videojs, { VideoJsPlayer } from 'video.js';
import 'video.js/dist/video-js.min.css';

import './videojs-comp.less';

const VjsButton = videojs.getComponent('Button');
const clsPrefix = 'vjs-danmaku-';
function getClsName(prefix, ...cls) {
    return cls.map(ele => prefix + ele).join(' ');
}
type DanmakOptions = {
    hide?: boolean;
};
export type DanmakuPlayerOptions = videojs.PlayerOptions & {
    danmaku?: DanmakOptions
}
export class DanmakuPlayer {
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
    }

    private initView() {
        let player = this.player;
        //修改control bar
        let controlBar = player.controlBar;
        let controlBarEl = controlBar.el();

        let danmakuHide = this.options.danmaku.hide;
        let danmakuBar = videojs.dom.createEl('div', {
            className: getClsName(clsPrefix, 'bar') + ' ' + danmakuHide ? 'vjs-hidden' : '',
        });
        let input = this.input = videojs.dom.createEl('input', {
            placeholder: '输点啥',
            className: getClsName(clsPrefix, 'input'),
        }) as any;

        let sendBtn = this.sendBtn = videojs.dom.createEl('button', {
            innerText: '发送',
            calssName: getClsName(clsPrefix, 'send') + ' vjs-control vjs-button',
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
        // We don't want a click to trigger playback when controls are disabled
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

    danmakuList: {
        idx: number,
        msg: string,
        color?: string;
        animeInst?: anime.AnimeInstance,
        finished?: boolean,
        dom?: HTMLElement,
        refName?: string;
    }[] = [];

    private get danmaku() {
        return this.input.value;
    }
    private set danmaku(val) {
        this.input.value = val;
    }
    private get color() {
        return '';
    }

    sendDanmaku() {
        let danmakuList = this.danmakuList;
        let danmaku = this.danmaku && this.danmaku.trim();
        if (danmaku) {
            let idx = danmakuList.length;
            let data = { msg: danmaku, color: this.color };
            danmakuList.push({ idx, refName: Date.now() + '', ...data });
            this.player.trigger('danmaku-send', data);
            this.danmaku = '';
        }
    }
}