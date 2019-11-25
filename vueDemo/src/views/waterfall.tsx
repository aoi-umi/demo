import { Component, Vue, Watch } from 'vue-property-decorator';

import vueWaterfallEasy from 'vue-waterfall-easy';

@Component({
    vueWaterfallEasy
})
export default class Waterfall extends Vue {
    imgsArr = [];
    group = 0;

    created() {
        this.getData()
    }
    getData() {
        this.imgsArr = [...this.imgsArr, ...[{
            "src": "https://lfyfly.github.io/vue-waterfall-easy/demo/static/img/1.jpg",
            "href": "https://www.baidu.com",
            "info": "一些图片描述文字"
        },]]
        this.group++;
    }

    render() {
        return (
            <div>
                <vueWaterfallEasy imgsArr={this.imgsArr} scrollReachBottom={() => {
                    return this.getData();
                }} />
            </div>
        );
    }
}