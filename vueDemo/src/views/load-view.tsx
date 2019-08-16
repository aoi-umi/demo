import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { convClass } from '@/helpers';
import { Base } from "./base";
import { Spin, Button, Card } from '@/components/iview';


@Component
class Load extends Base {
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

    loadData() {
        this.loading = true;
        this.operateHandler('', async () => {
            this.result.data = await this.loadFn();
        }, { noDefaultHandler: true }).then(rs => {
            this.result.success = rs.success;
            this.result.msg = rs.msg;
        }).finally(() => {
            this.loading = false;
        });
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


export const LoadView = convClass<Load>(Load);
export interface ILoadView extends Load { };