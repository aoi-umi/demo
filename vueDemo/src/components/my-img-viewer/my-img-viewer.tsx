import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { convClass } from '@/helpers';
import { Carousel, CarouselItem, Icon, Button } from '../iview';
import { MyImg } from '../my-img';
import * as style from '../style';
import './my-img-viewer.less';

const clsPrefix = 'my-img-viewer-';

@Component
class MyImgViewer extends Vue {
    @Prop({
        default: ''
    })
    src: string | string[];

    @Prop({
        default: true
    })
    maskClosable: boolean;

    visible = false;

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }

    render() {
        let list = this.src instanceof Array ? this.src : [this.src];
        let mutli = list.length > 1;
        return (
            <transition name="fade">
                {this.visible && <div class={style.cls.mask} on-click={() => {
                    if (this.maskClosable)
                        this.hide();
                }}>
                    <div class={clsPrefix + 'box'} on-click={(event) => {
                        event.stopPropagation();
                    }}>
                        <Carousel easing="easing" arrow={mutli ? 'hover' : 'never'} dots={mutli ? 'inside' : 'none'}>
                            {list.map(src => {
                                return (
                                    <CarouselItem>
                                        <div class={clsPrefix + 'item'}>
                                            <MyImg src={src} style={{ maxHeight: '460px', maxWidth: '800px' }} />
                                        </div>
                                    </CarouselItem>
                                );
                            })}
                        </Carousel>
                        <Button shape="circle" icon="md-close" type="error" class={clsPrefix + 'close-btn'} on-click={this.hide} />
                    </div>
                </div >}
            </transition>
        );
    }
}

const MyImgViewerView = convClass<MyImgViewer>(MyImgViewer);
export default MyImgViewerView;
export interface IMyImgViewer extends MyImgViewer { }