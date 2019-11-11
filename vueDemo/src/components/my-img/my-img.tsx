import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { convClass } from '../utils';
import { Icon } from '../iview';
import { MyBase } from '../my-base';
import './my-img.less';

@Component
class MyImg extends MyBase {
    @Prop()
    src?: string;

    @Prop()
    alt?: string;

    @Prop()
    failImg?: string;

    @Prop()
    vLazy?: string;

    @Watch('src')
    private watchSrc(newVal) {
        this.isLoadSuccess = !!newVal;
    }

    $refs: { img: HTMLElement }
    private isLoadSuccess = !!this.src;
    stylePrefix = 'my-img-';

    handleError(e) {
        this.isLoadSuccess = false;
    }
    private isFail = false;
    render() {
        this.isFail = this.src && !this.isLoadSuccess;
        let rootCls = this.getStyleName('root');
        if (this.isFail && !this.failImg)
            rootCls.push('fail-icon');
        return (
            <div class={rootCls}>
                {!this.src ?
                    <Icon type="md-image" size={40} style={{ lineHeight: '90px' }} /> :
                    <img ref="img" class={this.getStyleName('image')} v-show={this.isLoadSuccess} on-error={this.handleError} src={this.src} alt={this.alt} />
                }
                {this.isFail &&
                    (this.failImg ? <img src={this.failImg} alt={this.alt} /> :
                        <Icon type="md-alert" size={40} style={{ lineHeight: '90px' }} />)
                }
            </div>
        );
    }
}

const MyImgView = convClass<MyImg>(MyImg);
export default MyImgView;