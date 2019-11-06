import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { testApi } from '@/api';
import errConfig, { getErrorCfgByCode } from '@/config/error';
import { convClass } from '@/components/utils';
import { Carousel, CarouselItem, Row, Col, Divider, Input, Button, Card } from '@/components/iview';
import { MyTag, TagType } from '@/components/my-tag';
import { MyLoad } from '@/components/my-load';
import { MyImg } from '@/components/my-img';

import { Base } from '../base';
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

        //不可选项
        this.specTag.forEach((ele, idx) => {
            ele.value.forEach(v => {
                v.disabled = false;
            });
        });
        this.specTag.forEach((ele, idx) => {
            if (selectSpec[idx]) {
                this.specTag.forEach((ele2, idx2) => {
                    if (idx !== idx2) {
                        ele2.value.forEach((v, vIdx) => {
                            let match = this.data.sku.find(s => s.spec[idx] === selectSpec[idx] && s.spec[idx2] === v.key);
                            if (!match)
                                v.disabled = true;
                        });
                    }
                });
            }
        });
    }

    private buy() {
        this.operateHandler('购买', async () => {
            throw new Error('还没写');
        });
    }

    render() {
        let { spu } = this.data;
        let multi = spu.imgUrls.length > 1;
        return (
            <div>
                <h2>{spu.name}</h2>
                <Row gutter={20}>
                    <Col xs={24} sm={8}>
                        <Carousel class={this.getStyleName('carousel')} loop height={200}
                            arrow={multi ? 'hover' : 'never'}
                            dots={multi ? 'inside' : 'none'}
                        >
                            {spu.imgUrls.map(ele => {
                                return (
                                    <CarouselItem>
                                        <div class={this.getStyleName('carousel-img')}>
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
                                <div>
                                    <span>单价: {this.sku.price}</span>
                                    <Input type="number" v-model={this.quantity} style={{ width: '60px', marginLeft: '10px' }} />/{this.sku.quantity}
                                </div>
                            }
                            <div class={this.getStyleName('buy')}>
                                <span>总价:{((this.sku ? this.sku.price : 0) * this.quantity).toFixed(2)}</span>
                                <Button disabled={!this.sku} on-click={() => {
                                    this.buy();
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
