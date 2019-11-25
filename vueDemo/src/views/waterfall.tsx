import { Component, Vue, Watch } from 'vue-property-decorator';
import vueWaterfallEasy from 'vue-waterfall-easy';

import { Base } from './base';
import './demo.less';

@Component({
    vueWaterfallEasy
})
export default class Waterfall extends Base {
    stylePrefix = 'waterfall-';
    imgsArr = [];
    group = 0;

    created() {
        this.getData()
    }
    getData() {
        let list = Array.from(new Array(10)).map((ele, idx) => {
            let id = idx % 2 == 0 ? 1 : 11;
            if (this.group % 2 == 0)
                id = idx % 2 == 0 ? 4 : 5;
            return {
                "src": `https://lfyfly.github.io/vue-waterfall-easy/demo/static/img/${id}.jpg`,
                "href": "https://www.baidu.com",
                "info": "一些图片描述文字"
            }
        });
        // this.imgsArr = [...this.imgsArr, ...list];
        this.imgsArr.splice(this.imgsArr.length - 1, 0, ...list);
        this.group++;
    }

    imgErrorFn(imgItem) {
        console.log('图片加载错误', imgItem)
    }

    render() {
        return (
            <div class={this.getStyleName('root')}>
                <vueWaterfallEasy imgsArr={this.imgsArr} scrollReachBottom={() => {
                    this.getData();
                }} imgError={(e) => {
                    this.imgErrorFn(e);
                }} />
            </div>
        );
    }
}