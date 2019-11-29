import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { convClass, Utils } from '../utils';
import { MyBase } from '../my-base';
import './my-waterfall.less';

export type MyWaterfallDataType = {
    src: string;
};
type MyWaterfallItemType = {
    data: MyWaterfallDataType,
    loaded: boolean,
    success: boolean,
    height: number,
    bottom?: number,
    left?: number,
    colIdx?: number,
    style: any,
    img: HTMLImageElement,
    timer?: any
};

type GetDataFnResult<T> = { data: T[], finished?: boolean };

const ScrollElm = {
    window: 'window' as 'window',
    root: 'root' as 'root'
};
type TypeOfValue<T> = T[keyof T];
@Component
class MyWaterfall extends MyBase {
    stylePrefix = 'my-waterfall-';

    @Prop({
        default: () => (width) => {
            if (width < 576)
                return 2;
            if (width < 768)
                return 3;
            return 5;
        }
    })
    col: number | ((width: number) => number);

    @Prop({
        default: 10
    })
    space: number;

    @Prop({
        default: 20
    })
    timeout: number;

    /**
     * 滚动的元素，默认为window
     * 设为root时，给root一个高度
     */
    @Prop({
        default: ScrollElm.window
    })
    scrollElm?: TypeOfValue<typeof ScrollElm>;

    @Prop({
        required: true
    })
    getDataFn: <T = MyWaterfallDataType>() => GetDataFnResult<T> | Promise<GetDataFnResult<T>>;

    @Prop()
    maskContentRenderFn: (item: any) => any;

    $refs: { root: HTMLDivElement; };

    currVal: any[] = [];

    private actualCol = 1;
    @Watch('col')
    private watchCol() {
        if (typeof this.col !== 'function')
            this.actualCol = this.col;
        else
            this.actualCol = this.col(this.$refs.root.clientWidth);
    }
    private itemList: MyWaterfallItemType[] = [];

    private getScrollElm() {
        return this.scrollElm === ScrollElm.root ? this.$refs.root : window;
    }
    protected mounted() {
        this.watchCol();
        window.addEventListener('resize', this.handleResize);
        this.getScrollElm().addEventListener('scroll', this.handleScrollEnd);
    }

    protected beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
        this.getScrollElm().removeEventListener('scroll', this.handleScrollEnd);
    }

    private handleResize() {
        this.watchCol();
        this.handleItemStyle();
        this.handleScrollEnd();
    }

    private loading = false;
    private get imgLoading() {
        return !!this.itemList.find(ele => !ele.loaded);
    }
    private handleScrollEnd() {
        if (!this.finished && !this.loading && !this.imgLoading && Utils.isScrollEnd(this.getScrollElm())) {
            this.getData();
        }
    }

    protected created() {
        this.getData();
    }

    private finished = false;
    async getData(refresh?: boolean) {
        this.loading = true;
        let { data, finished } = await this.getDataFn();
        this.loading = false;
        this.finished = finished;

        this.currVal = refresh ? data : [...this.currVal, ...data];
    }
    @Watch('currVal')
    private watchCurrVal() {
        this.itemList = this.currVal.map((ele, idx) => {
            let old = this.itemList.find(e => e.data === ele);
            if (old)
                return old;
            let img = new Image();

            let obj: MyWaterfallItemType = {
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
            if (this.timeout > 0) {
                obj.timer = setTimeout(() => {
                    this.imgLoaded(obj);
                }, this.timeout * 1000);
            }
            img.src = ele.src;
            return obj;
        });
    }
    private imgLoaded(obj: MyWaterfallItemType) {
        let idx = this.itemList.findIndex(item => item === obj);
        if (obj.timer)
            clearTimeout(obj.timer);
        if (idx === -1 || obj.loaded)
            return;
        let img = obj.img;
        obj.loaded = true;
        obj.success = !!img.height;
        this.handleItemStyle();
    }

    private handleItemStyle() {
        /*
        |<----------clientWidth-------------->|<-space->|
        |  col1                 |  col2       |
        |<-itemWidth->|<-space->|<-itemWidth->|
        |                       |             |
        |-------------------------------------|        
         */
        let padding = 5;
        let clientWidth = this.$refs.root.clientWidth + this.space;
        let itemWidth = Math.floor(clientWidth / this.actualCol) - this.space;
        let lastShowIdx = -1;
        let divHeight = 0;
        for (let i = 0; i < this.itemList.length; i++) {
            let item = this.itemList[i];
            let show = item.loaded && lastShowIdx < i;
            if (!show)
                break;
            lastShowIdx = i;

            /*                                
            已知：x(itemWidth),padding,imgX,imgY
            求y
            imgY/imgX = y1/x1
            => y = y1 + 2 * padding
                = imgY/imgX * x1 + 2 * padding
            |<-------x------->|
            |      padding    |
            |  |-----x1-----| |
            y  y1           | |
            |  |------------| |
            |                 |
            |-----------------|
            */
            let width = itemWidth;
            let height = item.height = Math.round(item.img.height ?
                (item.img.height / item.img.width) * (width - 2 * padding) + 2 * padding
                : itemWidth);
            item.style = {
                width: width + 'px',
                height: height + 'px',
                padding: padding + 'px',
            };

            //第一行
            let left = (itemWidth + this.space) * i, top = 0;
            item.colIdx = i % this.actualCol;
            if (i >= this.actualCol) {
                //记录每一列最后一个,获取bottom最小的,在该item下面添加当前元素
                let colDict = {};
                for (let idx = 0; idx < i; idx++) {
                    let ele = this.itemList[idx];
                    colDict[ele.colIdx] = ele;
                }
                let minBottomCol: MyWaterfallItemType;
                Object.values<MyWaterfallItemType>(colDict).forEach(ele => {
                    if (!minBottomCol || minBottomCol.bottom > ele.bottom)
                        minBottomCol = ele;
                });
                item.colIdx = minBottomCol.colIdx;
                top = minBottomCol.bottom + this.space;
                left = minBottomCol.left;
            }
            item.bottom = top + item.height;
            item.left = left;
            item.style.top = top + 'px';
            item.style.left = left + 'px';
            item.style.transform = 'scale(1)';
            if (item.bottom > divHeight) {
                divHeight = item.bottom;
            }
        }
        this.divHeight = divHeight;
        //高度不足时触发加载
        this.handleScrollEnd();
    }

    private divHeight = 0;
    protected render() {
        return (
            <div ref='root' class={this.getStyleName('root')}>
                <div class={this.getStyleName('main')} style={{ height: this.divHeight + 'px' }}>
                    {this.itemList.map(ele => {
                        return (
                            <div class={this.getStyleName('item')} style={ele.style} on-click={(e) => {
                                this.$emit('item-click', e, ele.data);
                            }}>
                                <img src={ele.data.src} />
                                {this.maskContentRenderFn &&
                                    <div class={this.getStyleName('item-mask')}>
                                        {this.maskContentRenderFn(ele.data)}
                                    </div>
                                }
                            </div>
                        );
                    })}
                </div>
                <div class={this.getStyleName('bottom-box')}>
                    {this.finished && !this.imgLoading && (this.$slots.loaded || <span>加载完毕</span>)}
                    <div style={{ visibility: (this.loading || this.imgLoading) ? '' : 'hidden' }}>
                        {this.$slots.loading || <span>加载中</span>}
                    </div>
                </div>
            </div>
        );
    }
}

const MyWaterfallView = convClass<MyWaterfall>(MyWaterfall);
export default MyWaterfallView;