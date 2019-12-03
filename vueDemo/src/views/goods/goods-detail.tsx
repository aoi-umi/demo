import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import * as mathjs from 'mathjs';

import { testApi } from '@/api';
import errConfig, { getErrorCfgByCode } from '@/config/error';
import { myEnum } from '@/config';
import { convClass } from '@/components/utils';
import { Carousel, CarouselItem, Row, Col, Divider, Input, Button, Card, Modal, RadioGroup, Radio } from '@/components/iview';
import { MyTag, TagType } from '@/components/my-tag';
import { MyLoad } from '@/components/my-load';
import { MyImg } from '@/components/my-img';
import { MyImgViewer, IMyImgViewer } from '@/components/my-img-viewer';
import { MyNumber } from '@/components/my-number';

import { Base } from '../base';
import { PayView } from '../comps/pay';
import { DetailType, SkuType } from './goods-mgt-detail';

import './goods.less';

@Component
export default class GoodsDetail extends Base {
    stylePrefix = "goods-";
    private innerDetail: DetailType = {} as any;
    private async loadDetailData() {
        let query = this.$route.query;
        let detail = await testApi.goodsDetailQuery({ _id: query._id });
        this.innerDetail = detail;
        return detail;
    }

    protected render() {
        return (
            <div>
                <MyLoad
                    loadFn={this.loadDetailData}
                    renderFn={(detail: DetailType) => {
                        return <GoodsDetailMainView data={detail} />;
                    }}
                    errMsgFn={(e) => {
                        if (getErrorCfgByCode(e.code))
                            return '商品不存在或已删除';
                        return e.message;
                    }}
                />
            </div>
        );
    }
}

@Component
class GoodsDetailMain extends Base {
    stylePrefix = 'goods-';
    $refs: { imgViewer: IMyImgViewer };

    @Prop({
        required: true
    })
    data: DetailType;

    specTag: { name: string, value: TagType[] }[] = [];
    @Watch('data')
    protected watchData(newValue: DetailType) {
        this.specTag = newValue.specGroup.map(e => {
            return {
                name: e.name,
                value: e.value.map((v) => {
                    return {
                        key: v,
                        tag: v,
                        checkable: true,
                    };
                }),
            };
        });
    }

    typeList: { key: string; value: any, checked?: boolean }[] = [];
    created() {
        this.typeList = myEnum.assetSourceType.toArray().filter(ele => ele.value === myEnum.assetSourceType.支付宝).map(ele => {
            ele['checked'] = false;
            return ele;
        });
        this.watchData(this.data);
        this.selectSpec();
    }

    sku: SkuType = null;
    buyInfo = {
        name: '',
        payType: myEnum.assetSourceType.支付宝,
        quantity: 1,
    };
    get totalPrice() {
        return mathjs.round((this.sku ? this.sku.price : 0) * this.buyInfo.quantity, 2) as number;
    }

    selectSpec() {
        let selectSpec = [];
        let selectFinish = true;
        for (let i = 0; i < this.specTag.length; i++) {
            let ele = this.specTag[i];
            let match = ele.value.find(v => v.checked);
            if (match) {
                selectSpec.push(match.key);
            }
            else {
                selectSpec.push(null);
                selectFinish = false;
            }
        }
        if (selectFinish) {
            this.sku = this.data.sku.find(ele => {
                let match = true;
                if (ele.spec.length !== this.specTag.length) {
                    match = false;
                } else {
                    for (let idx = 0; idx < selectSpec.length; idx++) {
                        if (selectSpec[idx] !== ele.spec[idx]) {
                            match = false;
                            break;
                        }
                    }
                }
                return match;
            });
        } else {
            this.sku = null;
        }
        this.buyInfo.name = this.sku ? this.data.spu.name + '-' + this.sku.name : '';

        function canBuy(s) {
            return s.quantity > 0 && s.status === myEnum.goodsSkuStatus.上架;
        }
        //不可选项
        this.specTag.forEach((ele, idx) => {
            ele.value.forEach(v => {
                v.disabled = !this.data.sku.find(s => canBuy(s) && s.spec[idx] === v.key);
            });

            if (selectSpec[idx]) {
                this.specTag.forEach((ele2, idx2) => {
                    if (idx !== idx2) {
                        ele2.value.forEach((v, vIdx) => {
                            let match = this.data.sku.find(s =>
                                canBuy(s)
                                && s.spec[idx] === selectSpec[idx] && s.spec[idx2] === v.key);
                            if (!match)
                                v.disabled = true;
                        });
                    }
                });
            }
        });
    }

    private payShow = false;
    private async buy() {
        let { payInfo } = await testApi.goodsBuy({
            quantity: this.buyInfo.quantity,
            payType: this.buyInfo.payType,
            totalPrice: this.totalPrice,
            skuId: this.sku._id,
        });
        return payInfo;
    }

    showUrl = '';
    render() {
        let { spu } = this.data;
        let multi = spu.imgUrls.length > 1;
        return (
            <div>
                <Modal v-model={this.payShow} footer-hide >
                    <PayView payFn={async () => {
                        return this.buy();
                    }}>
                        <p>{this.buyInfo.name}</p>
                        <p>支付金额: {this.totalPrice.toFixed(2)}</p>
                    </PayView>
                </Modal>
                <h2>{spu.name}</h2>
                <MyImgViewer ref="imgViewer" src={this.showUrl} />
                <Row gutter={20}>
                    <Col xs={24} sm={8}>
                        <Carousel class={this.getStyleName('carousel')} loop
                            arrow={multi ? 'hover' : 'never'}
                            dots={multi ? 'inside' : 'none'}
                        >
                            {spu.imgUrls.map(ele => {
                                return (
                                    <CarouselItem class={this.getStyleName('carousel-item')}>
                                        <div class={this.getStyleName('carousel-img')} on-click={() => {
                                            this.showUrl = ele;
                                            this.$refs.imgViewer.show();
                                        }} >
                                            <MyImg src={ele} />
                                        </div>
                                    </CarouselItem>
                                );
                            })}
                        </Carousel>
                    </Col>
                    <Col xs={24} sm={16}>
                        {this.specTag.map((ele, idx) => {
                            return (
                                <div>
                                    <div>
                                        <span class={this.getStyleName('spec-name')}>{ele.name}</span>
                                    </div>
                                    <div>
                                        <MyTag value={ele.value} singleCheck on-change={() => {
                                            this.selectSpec();
                                        }} />
                                    </div>
                                    <Divider />
                                </div>
                            );
                        })}
                    </Col>
                    <Card class={this.getStyleName('buy-box')}>
                        <div class={this.getStyleName('buy-box-cont')}>
                            {this.sku &&
                                <div class={this.getStyleName('count-box')}>
                                    <div>
                                        单价 {this.sku.price} / 库存 {this.sku.quantity}
                                    </div>
                                    <MyNumber v-model={this.buyInfo.quantity} min={1} max={this.sku.quantity} />
                                </div>
                            }
                            <div class={this.getStyleName('buy')}>
                                <span>总价:{this.totalPrice.toFixed(2)}</span>
                                <Button disabled={!this.sku} on-click={() => {
                                    this.payShow = true;
                                }}>立即购买</Button>
                            </div>
                        </div>
                    </Card>
                </Row>
            </div>
        );
    }
}

export const GoodsDetailMainView = convClass<GoodsDetailMain>(GoodsDetailMain);
