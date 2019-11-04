import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { convClass } from '@/components/utils';
import { Carousel, CarouselItem, Row, Col, Divider, Input, Button } from '@/components/iview';
import { MyTag, TagType } from '@/components/my-tag';

import { Base } from '../base';
import { DetailType, SkuType } from './goods-mgt-detail';

import './goods.less';

@Component
class GoodsDetailMain extends Base {
    stylePrefix = 'goods-';

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

    created() {
        this.watchData(this.data);
    }

    sku: SkuType = null;
    quantity = 1;

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

        
        let selectableSpec: { [key: string]: any[] } = {};
        for (let idx = 0; idx < selectSpec.length; idx++) {
            selectableSpec[idx] = [];
        }
        this.data.sku.forEach(ele => {
            let rs = true;
            for (let idx = 0; idx < ele.spec.length; idx++) {
                if (selectSpec[idx] && selectSpec[idx] !== ele.spec[idx]) {
                    rs = false;
                    break;
                }
            }
            if (rs) {
                ele.spec.forEach((s, idx) => {
                    if (!selectableSpec[idx].includes(s)) {
                        selectableSpec[idx].push(s);
                    }
                });
            }
        });
        console.log(selectableSpec)
        //不可选项
        this.specTag.forEach((ele, idx) => {
            ele.value.forEach(v => {
                v.disabled = !selectableSpec[idx].includes(v.key);
            });
        });
    }

    render() {
        let { spu } = this.data;
        let multi = spu.imgUrls.length > 1;
        return (
            <div>
                <h2>{spu.name}</h2>
                <Row>
                    <Col xs={24} sm={8}>
                        <Carousel loop height={200}
                            arrow={multi ? 'hover' : 'never'}
                            dots={multi ? 'inside' : 'none'}
                        >
                            {spu.imgUrls.map(ele => {
                                return (
                                    <CarouselItem>
                                        <div class={this.getStyleName('carousel')}>
                                            <img src={ele} />
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
                    <Col xs={24}>
                        {this.sku &&
                            <div>
                                <span>单价: {this.sku.price}</span>
                                <Input type="number" v-model={this.quantity} style={{ width: '100px' }} />/{this.sku.quantity}
                                <div class={this.getStyleName('buy')}>
                                    <span>总价:{(this.sku.price * this.quantity).toFixed(2)}</span>
                                    <Button>立即购买</Button>
                                </div>
                            </div>
                        }
                    </Col>
                </Row>
            </div >
        );
    }
}

export const GoodsDetailMainView = convClass<GoodsDetailMain>(GoodsDetailMain);
