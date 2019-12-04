import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { convClass } from '../utils';
import { Carousel, CarouselItem, Icon, Button } from '../iview';
import { MyImg } from '../my-img';
import { MyBase } from '../my-base';
import * as style from '../style';

import './style.less';

@Component
class MyImgViewer extends MyBase {
    @Prop({
        default: ''
    })
    src: string | string[];

    @Prop({
        default: true
    })
    maskClosable: boolean;

    created() {
        this.watchSrc();
    }
    private list: { src: string; scale: number }[] = [];
    @Watch('src')
    private watchSrc() {
        this.list = (this.src instanceof Array ? this.src : [this.src]).map(src => {
            return {
                src,
                scale: 1
            };
        });
    }

    visible = false;

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }
    stylePrefix = 'my-img-viewer-';

    render() {
        let list = this.list;
        let mutli = list.length > 1;
        return (
            <transition name="fade">
                {this.visible && <div class={style.cls.mask} on-click={() => {
                    if (this.maskClosable)
                        this.hide();
                }} on-touchmove={(event) => {
                    event.preventDefault();
                }} on-mousewheel={(event) => {
                    event.preventDefault();
                }}>
                    <div class={this.getStyleName('box')} on-click={(event) => {
                        event.stopPropagation();
                    }}>
                        <Carousel easing="easing" arrow={mutli ? 'hover' : 'never'} dots={mutli ? 'inside' : 'none'}>
                            {list.map(ele => {
                                let transform = `scale(${ele.scale})`;
                                return (
                                    <CarouselItem>
                                        <div class={this.getStyleName('item')} on-mousewheel={(event) => {
                                            let scale = ele.scale;
                                            let step = 0.1;
                                            scale = scale + (event.wheelDeltaY > 0 ? 1 : -1 + step);
                                            if (scale > 5) {
                                                scale = 5;
                                            } else if (scale < 0.5) {
                                                scale = 0.5;
                                            }
                                            ele.scale = scale;
                                        }}>
                                            <MyImg class={this.getStyleName('img')} src={ele.src} style={{ transform }} />
                                        </div>
                                    </CarouselItem>
                                );
                            })}
                        </Carousel>
                        <Button shape="circle" icon="md-close" type="error" class={this.getStyleName('close-btn')} on-click={this.hide} />
                    </div>
                </div >}
            </transition>
        );
    }
}

const MyImgViewerView = convClass<MyImgViewer>(MyImgViewer);
export default MyImgViewerView;
export interface IMyImgViewer extends MyImgViewer { }