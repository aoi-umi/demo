import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { convClass } from '@/helpers';
import { Spin, Button, Card } from '@/components/iview';


@Component
class MyLoad extends Vue {
    @Prop()
    loadFn: () => Promise<any>;

    @Prop()
    renderFn: (data: any) => any;

    loading = false;
    result = {
        success: false,
        msg: '准备加载',
        data: null,
    };

    async loadData() {
        this.loading = true;
        try {
            this.result.data = await this.loadFn();
            this.result.success = true;
        } catch (e) {
            this.result.success = false;
            this.result.msg = e.message;
        } finally {
            this.loading = false;
        }
    }

    render() {
        if (!this.result.success) {
            return (
                <div style={{ position: 'relative', }}>
                    <Card class="center" style={{ height: '200px', }}>
                        {this.loading ? <Spin size="large" fix /> :
                            <div class="center" style={{ flexFlow: 'column' }}>
                                {this.result.msg}
                                <Button style={{ margin: '5px' }} on-click={this.loadData}>重试</Button>
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