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
    style: any,
    img: HTMLImageElement
};

type GetDataFnResult<T> = { data: T[], finished?: boolean };

@Component
class MyWaterfall extends MyBase {
    stylePrefix = 'my-waterfall-';

    @Prop({
        default: 5
    })
    rowItemCount: number;

    @Prop({
        default: 15
    })
    space: number;

    @Prop({
        required: true
    })
    getDataFn: <T = MyWaterfallDataType>() => GetDataFnResult<T> | Promise<GetDataFnResult<T>>;

    @Prop()
    maskContentRenderFn: (item: any) => any;

    $refs: { root: HTMLDivElement; };

    currVal: any[] = [];

    private itemList: MyWaterfallItemType[] = [];

    protected mounted() {
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('scroll', this.handleScrollEnd);
    }

    protected beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScrollEnd);
    }

    private handleResize() {
        this.handleItemStyle();
    }

    private loading = false;
    private get imgLoading() {
        return !!this.itemList.find(ele => !ele.loaded);
    }
    private handleScrollEnd() {
        if (!this.finished && !this.loading && Utils.isScrollEnd() && !this.imgLoading) {
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
    private imgLoaded(obj: MyWaterfallItemType) {
        let idx = this.itemList.findIndex(item => item === obj);
        if (idx === -1)
            return;
        let img = obj.img;
        obj.loaded = true;
        obj.success = !!img.height;
        this.handleItemStyle();
    }

    private handleItemStyle() {
        let itemWidth = Math.round(this.$refs.root.clientWidth / this.rowItemCount);
        let lastShowIdx = -1;
        let divHeight = 0;
        for (let i = 0; i < this.itemList.length; i++) {
            let item = this.itemList[i];
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
            let lastCol = this.itemList[i - this.rowItemCount];
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

    private divHeight = 0;
    protected render() {
        return (
            <div ref='root'>
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
                    {(this.loading || this.imgLoading) && (this.$slots.loading || <span>加载中</span>)}
                    {this.finished && !this.imgLoading && (this.$slots.loaded || <span>加载完毕</span>)}
                </div>
            </div>
        );
    }
}

const MyWaterfallView = convClass<MyWaterfall>(MyWaterfall);
export default MyWaterfallView;