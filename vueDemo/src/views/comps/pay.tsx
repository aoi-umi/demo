import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { myEnum } from '@/config';
import { convClass, getCompOpts } from '@/components/utils';
import { RadioGroup, Radio, Button, Modal, Spin } from '@/components/iview';

import { Base } from '../base';

import './pay.less';
import { MyQrcode, IMyQrcode } from '@/components/my-qrcode';

const ShowType = {
    网页: 'web',
    二维码: 'qrcode'
};

class PayProp {
    @Prop({
        default: myEnum.assetSourceType.支付宝
    })
    payType?: number;

    @Prop({
        required: true
    })
    payFn: () => Promise<{ url: string }>;
}
@Component({
    extends: Base,
    mixins: [getCompOpts(PayProp)]
})
class Pay extends Vue<PayProp & Base> {
    stylePrefix = 'comp-pay-';

    $refs: { qrcode: IMyQrcode; }

    private typeList: { key: string; value: any, checked?: boolean }[] = [];
    protected created() {
        this.typeList = myEnum.assetSourceType.toArray().filter(ele => ele.value === myEnum.assetSourceType.支付宝).map(ele => {
            ele['checked'] = false;
            return ele;
        });
    }

    private creatingPay = false;
    private pay() {
        this.creatingPay = true;
        this.operateHandler('调起支付', async () => {
            let rs = await this.payFn();
            if (this.payType === myEnum.assetSourceType.微信) {
                this.payBoxShow = true;
                this.showType = ShowType.二维码;
                this.showPayContent(rs.url);
            } else {
                window.open(rs.url, '_blank');
            }
        }, {
            noSuccessHandler: true,
        }).finally(() => {
            this.creatingPay = false;
        });
    }
    private showType = ShowType.网页;
    private showPayContent(url) {
        if (this.showType === ShowType.二维码)
            this.$refs.qrcode.drawQrcode(url);
    }

    private payBoxShow = false;
    protected render() {
        return (
            <div class={this.getStyleName('root')}>
                {this.$slots.default}
                <Modal v-model={this.payBoxShow} footer-hide mask-closable={false}>
                    <div class={this.getStyleName('pay-content')}>
                        <MyQrcode ref="qrcode" v-show={this.showType === ShowType.二维码} />
                    </div>
                </Modal>
                <RadioGroup v-model={this.payType}>
                    {this.typeList.map(ele => {
                        return <Radio label={ele.value}>{ele.key}</Radio>;
                    })}
                </RadioGroup>
                <div class={this.getStyleName('submit-btn')}>
                    <Button type="primary" loading={this.creatingPay} on-click={() => {
                        this.pay();
                    }}>支付</Button>
                </div>
            </div>
        );
    }

}

export const PayView = convClass<PayProp>(Pay);