import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { convClass } from '@/helpers';
import { Icon } from '../iview';
import './my-img.less';

const clsPrefix = 'my-img-';

@Component
class MyImg extends Vue {
    @Prop()
    src?: string;

    @Prop()
    alt?: string;

    @Prop()
    failImg?: string;

    @Watch('src')
    private watchSrc(newVal) {
        this.isLoadSuccess = !!newVal;
    }

    $refs: { img: HTMLElement }
    private isLoadSuccess = !!this.src;

    handleError(e) {
        this.isLoadSuccess = false;
    }

    render() {
        return (
            <div class={clsPrefix + 'root'}>
                {!this.src ?
                    <Icon type="md-image" size={40} style={{ lineHeight: '90px' }} /> :
                    <img ref="img" class={clsPrefix + 'image'} v-show={this.isLoadSuccess} on-error={this.handleError} src={this.src} alt={this.alt} />
                }
                {this.src && !this.isLoadSuccess &&
                    (this.failImg ? <img src={this.failImg} alt={this.alt} /> :
                        <Icon type="md-alert" size={40} style={{ lineHeight: '90px' }} />)
                }
            </div>
        );
    }
}

const MyImgView = convClass<MyImg>(MyImg);
export default MyImgView;