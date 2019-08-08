import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { convClass } from '@/helpers';
import { Carousel, CarouselItem } from '../iview';
import { MyImg } from '../my-img';
import * as style from '../style';
import './my-img-viewer.less';

const clsPrefix = 'my-img-viewer-';

@Component
class MyImgViewer extends Vue {
    @Prop({
        default: ''
    })
    src: string;

    render() {
        return (
            <div class={style.cls.mask}>
                <Carousel>
                    <CarouselItem>
                        <MyImg src={this.src} style={{ height: '100px', width: '100px' }} />
                    </CarouselItem>
                </Carousel>
            </div>
        );
    }
}

const MyImgViewerView = convClass<MyImgViewer>(MyImgViewer);
export default MyImgViewerView;
export interface IMyImgViewer extends MyImgViewer { }