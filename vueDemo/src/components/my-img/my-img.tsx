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
        if (!newVal)
            this.isLoadSuccess = false;
    }

    $refs: { img: HTMLElement }
    private isLoadSuccess = !!this.src;
    private get cls() {
        let cls = [clsPrefix + 'image'];
        if (!this.isLoadSuccess)
            cls.push('hidden');
        return cls;
    }

    handleError(e) {
        this.isLoadSuccess = false;
    }

    render() {
        return (
            <div class={clsPrefix + 'root'}>
                <div class={clsPrefix + 'main'}>
                    {this.src && <img ref="img" class={this.cls} on-error={this.handleError} src={this.src} alt={this.alt} />}
                    {!this.isLoadSuccess &&
                        (this.failImg ? <img src={this.failImg} alt={this.alt} /> :
                            <Icon type="md-image" size={40} />)
                    }
                </div>
            </div>
        );
    }
}

const MyImgView = convClass<MyImg>(MyImg);
export default MyImgView;