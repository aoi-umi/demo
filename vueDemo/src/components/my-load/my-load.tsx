import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { convClass } from '../utils';
import { Spin, Button, Card } from '../iview';
import { MyBase } from '../my-base';
import { cls } from '../style';

import './style.less';

@Component
class MyLoad extends MyBase {
    stylePrefix = 'my-load-';
    @Prop()
    loadFn: () => Promise<any>;

    @Prop()
    renderFn: (data: any) => any;

    @Prop()
    width?: number;

    @Prop({
        default: 200
    })
    height?: number;

    @Prop()
    notLoadOnMounted?: boolean;

    @Prop()
    errMsgFn?: (e) => string;

    loading = false;
    result = {
        success: false,
        msg: '准备加载',
        data: null,
    };

    protected mounted() {
        if (!this.notLoadOnMounted)
            this.loadData();
    }

    async loadData() {
        this.loading = true;
        try {
            this.result.data = await this.loadFn();
            this.result.success = true;
        } catch (e) {
            this.result.success = false;
            this.result.msg = (this.errMsgFn && this.errMsgFn(e)) || e.message;
        } finally {
            this.loading = false;
        }
    }

    protected render() {
        if (!this.result.success) {
            return (
                <div class={this.getStyleName('root')}>
                    <Card class={cls.center} style={{ height: this.height ? this.height + 'px' : null, width: this.width ? this.width + 'px' : null }}>
                        {this.loading ? <Spin size="large" fix /> :
                            <div class={this.getStyleName('content').concat(cls.center)}>
                                {this.result.msg}
                                <Button class={this.getStyleName('retry-btn')} on-click={this.loadData}>重试</Button>
                            </div>
                        }
                    </Card>
                </div>
            );
        }

        return this.renderFn(this.result.data);
    }
}


const MyLoadView = convClass<MyLoad>(MyLoad);
export default MyLoadView;
export interface IMyLoad extends MyLoad { };