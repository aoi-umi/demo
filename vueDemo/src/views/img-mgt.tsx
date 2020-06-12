import { Component, Vue, Watch } from 'vue-property-decorator';

import { Button } from '@/components/iview';
import { MyWaterfall } from '@/components/my-waterfall';
import { MyImgViewer, IMyImgViewer } from '@/components/my-img-viewer';

import { Base } from './base';
import { testApi } from '@/api';
@Component
export default class Waterfall extends Base {
    $refs: { root: HTMLDivElement; imgViewer: IMyImgViewer };
    stylePrefix = 'img-mgt';
    imgsArr = [];

    page = 1;
    rows = 10;
    async getData() {
        let rs = await testApi.myImgQuery({ page: this.page, rows: this.rows });
        let finished = rs.total == ((this.page - 1) * this.rows + rs.rows.length);
        this.page++;
        return {
            data: rs.rows.map(ele => ({
                src: ele.url,
                data: ele
            })),
            finished,
        };
    }

    showUrl = '';
    render() {
        return (
            <div ref='root' class={this.getStyleName('root')}>
                <MyImgViewer ref="imgViewer" src={this.showUrl} />

                <MyWaterfall
                    getDataFn={() => {
                        return this.getData();
                    }}
                    maskContentRenderFn={(item) => {
                        return <div>{item.data.filename}</div>;
                    }}
                    on-item-click={(e, item) => {
                        this.showUrl = item.src;
                        this.$refs.imgViewer.show();
                    }}
                />
            </div>
        );
    }
}