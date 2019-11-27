import { Component, Vue, Watch } from 'vue-property-decorator';
import vueWaterfallEasy from 'vue-waterfall-easy';

import { Base } from './base';
import './demo.less';
import { Button } from '@/components/iview';

type RenderItemType = {
    data: any,
    loaded: boolean,
    success: boolean,
    height: number,
    bottom?: number,
    style: any,
    img: HTMLImageElement
};
@Component({
    vueWaterfallEasy
})
export default class Waterfall extends Base {
    $refs: { root: HTMLDivElement; };
    stylePrefix = 'waterfall-';
    imgsArr = [];
    imgsArr2: RenderItemType[] = [];
    group = 0;
    type = '0';

    protected mounted() {
        window.addEventListener('resize', this.handleResize);
    }

    protected beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
    }

    @Watch('$route')
    watchRoute() {
        this.type = this.$route.query.type as any;
    }

    created() {
        this.getData()
        this.watchRoute();
    }

    getData(refresh?: boolean) {
        let list = Array.from(new Array(22)).map((ele, idx) => {
            let id = [1, 4, 5, 11][idx % 4];
            return {
                "src": `https://lfyfly.github.io/vue-waterfall-easy/demo/static/img/${id}.jpg`,
                "href": "https://www.baidu.com",
                "info": "一些图片描述文字"
            };
        });

        this.imgsArr = refresh ? list : [...this.imgsArr, ...list];
        this.group++;
    }
    @Watch('imgsArr')
    private wImg() {
        this.imgsArr2 = this.imgsArr.map((ele, idx) => {
            let old = this.imgsArr2.find(e => e.data === ele);
            if (old)
                return old;
            let img = new Image();

            let obj = {
                data: ele,
                loaded: false,
                success: false,
                height: 0,
                style: {} as any,
                img
            };
            img.onload = img.onerror = (e) => {
                this.imgLoaded(obj);
            };
            img.src = ele.src;
            return obj;
        });
    }

    rowItemCount = 5;
    space = 15;
    imgLoaded(obj: RenderItemType) {
        let idx = this.imgsArr2.findIndex(item => item === obj);
        if (idx === -1)
            return;
        let img = obj.img;
        obj.loaded = true;
        obj.success = !!img.height;
        this.handleItemStyle();
    }

    private handleResize() {
        this.handleItemStyle();
    }

    private handleItemStyle() {
        let itemWidth = Math.round(this.$refs.root.clientWidth / this.rowItemCount);
        let lastShowIdx = -1;
        let divHeight = 0;
        for (let i = 0; i < this.imgsArr2.length; i++) {
            let item = this.imgsArr2[i];
            let show = item.loaded && lastShowIdx < i;
            if (!show)
                break;
            lastShowIdx = i;
            let width = itemWidth - this.space;
            let height = item.height = Math.round(item.img.height ? (width / item.img.width) * item.img.height : itemWidth);
            item.style = {
                width: width + 'px',
                height: height + 'px',
            };
            let lastCol = this.imgsArr2[i - this.rowItemCount];
            let top = lastCol ? (lastCol.bottom + this.space) : 0;
            item.bottom = top + item.height;
            item.style.top = top + 'px';
            item.style.left = ((i % this.rowItemCount) * itemWidth) + 'px';
            item.style.transform = 'scale(1)';
            if (item.bottom > divHeight) {
                divHeight = item.bottom;
            }
        }
        this.divHeight = divHeight;
    }

    imgErrorFn(imgItem) {
        console.log('图片加载错误', imgItem)
    }
    private divHeight = 0;
    render() {
        return (
            <div ref='root' class={this.getStyleName('root')}>
                <Button on-click={() => {
                    this.getData(true);
                }} >刷新</Button>
                <Button on-click={() => {
                    this.getData();
                }} >加载</Button>
                {this.type != '1' ?
                    <div class={this.getStyleName('test0')}>
                        <vueWaterfallEasy imgsArr={this.imgsArr} scrollReachBottom={() => {
                            this.getData();
                        }} imgError={(e) => {
                            this.imgErrorFn(e);
                        }} />
                    </div> :
                    <div class={this.getStyleName('test1')} style={{ height: this.divHeight + 'px' }}>
                        {this.imgsArr2.map(ele => {
                            return (
                                <img class={this.getStyleName('item')} src={ele.data.src} style={ele.style} />
                            );
                        })}
                    </div>
                }
            </div>
        );
    }
}