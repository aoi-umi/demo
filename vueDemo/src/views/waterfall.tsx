import { Component, Vue, Watch } from 'vue-property-decorator';
import vueWaterfallEasy from 'vue-waterfall-easy';

import { Button } from '@/components/iview';
import { MyWaterfall } from '@/components/my-waterfall';

import { Base } from './base';
import './demo.less';
import { MyImgViewer, IMyImgViewer } from '@/components/my-img-viewer';

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
    $refs: { root: HTMLDivElement; imgViewer: IMyImgViewer };
    stylePrefix = 'waterfall-';
    imgsArr = [];
    group = 0;
    type = '0';

    @Watch('$route')
    watchRoute() {
        this.type = this.$route.query.type as any;
    }

    created() {
        this.getData()
        this.watchRoute();
    }

    async getDataFn(refresh?: boolean) {
        return new Promise<any>((resolve) => {
            let list = Array.from(new Array(22)).map((ele, idx) => {
                let id = [1, 4, 5, 11][idx % 4];
                return {
                    "src": `https://lfyfly.github.io/vue-waterfall-easy/demo/static/img/${id}.jpg`,
                    "href": "https://www.baidu.com",
                    "info": "一些图片描述文字"
                };
            });
            this.imgsArr = refresh ? list : [...this.imgsArr, ...list];
            setTimeout(() => {
                resolve({
                    data: list,
                    finished: this.imgsArr.length > 50,
                });
            }, 1000);
        });
    }

    getData(refresh?: boolean) {
        this.getDataFn(refresh);
        this.group++;
    }

    imgErrorFn(imgItem) {
        console.log('图片加载错误', imgItem)
    }
    showUrl = '';
    render() {
        return (
            <div ref='root' class={this.getStyleName('root')}>
                <MyImgViewer ref="imgViewer" src={this.showUrl} />
                {this.type == '1' ?
                    <div>
                        <Button on-click={() => {
                            this.getData(true);
                        }} >刷新</Button>
                        <Button on-click={() => {
                            this.getData();
                        }} >加载</Button>
                        <div class={this.getStyleName('test0')}>
                            <vueWaterfallEasy imgsArr={this.imgsArr} scrollReachBottom={() => {
                                this.getData();
                            }} imgError={(e) => {
                                this.imgErrorFn(e);
                            }} />
                        </div>

                    </div> :
                    <MyWaterfall
                        getDataFn={() => {
                            return this.getDataFn();
                        }}
                        maskContentRenderFn={(item) => {
                            return <div>test{item.src}</div>;
                        }}
                        on-item-click={(e, item) => {
                            this.showUrl = item.src;
                            this.$refs.imgViewer.show();
                        }}
                    />
                }
            </div>
        );
    }
}