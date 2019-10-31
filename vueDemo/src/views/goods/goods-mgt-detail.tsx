import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import moment from 'dayjs';
import * as iview from 'iview';

import { dev, myEnum, authority } from '@/config';
import { testApi } from '@/api';
import { routerConfig } from '@/router';
import { Form, FormItem, Input, Row, Col, Button, Divider, RadioGroup, Radio, DatePicker, Table, Select, Option } from '@/components/iview';
import { MyLoad } from '@/components/my-load';
import { MyUpload, FileDataType, IMyUpload, FileType } from '@/components/my-upload';

import { Base } from '../base';

import './goods.less';

type DetailType = {
    spu: {
        _id?: string;
        name: string;
        profile: string;
        imgs: string[];
        imgUrls: any[];
        status: number;
        statusText: string;
        putOnAt: string;
        expireAt: string;
    };
    sku: SkuType[];
    specGroup: SpecGroupType[];
};

type SpecGroupType = { name: string, value: string[] };
type SkuType = {
    spec: string[];
    status: number;
    price: number;
    quantity: number;
    saleQuantity: number;
    imgs: string[];
    imgUrls: any[];
};

@Component
export default class GoodsMgtDetail extends Base {
    stylePrefix = "goods-mgt-"
    $refs: { formVaild: iview.Form, imgs: IMyUpload };
    private innerDetail: DetailType = this.getDetailData();
    private preview = false;
    protected getDetailData() {
        let data = {
            spu: {
                name: '',
                profile: '',
                imgs: [],
                imgUrls: [],
                status: myEnum.goodsStatus.上架,
                statusText: '',
                putOnAt: '',
                expireAt: '',
            },
            specGroup: [{
                name: '款式',
                value: ['款式1']
            }],
            sku: [],
        };
        data.spu.statusText = myEnum.goodsStatus.getKey(data.spu.status);
        return data;
    }

    private async loadDetailData() {
        let query = this.$route.query;
        let detail: DetailType;
        if (query._id) {
            this.preview = this.$route.path == routerConfig.goodsMgtDetail.path;
            detail = await testApi.goodsMgtDetailQuery({ _id: query._id });
            let { spu } = detail;
            spu.imgUrls = spu.imgUrls.map((ele, idx) => {
                return { url: ele, fileType: FileDataType.图片, metadata: spu.imgs[idx] };
            });
            if (query.repost) {
                detail.spu._id = '';
            }
        } else {
            detail = this.getDetailData() as any;
        }
        this.innerDetail = detail;
        this.resetSku();
        //赋值到sku
        this.setRules();
        return detail;
    }

    rules = {};
    private setRules() {
        let spuRules = {
            name: [
                { required: true, trigger: 'blur', message: '请填写名称' }
            ],
            profile: [
                { required: true, trigger: 'blur', message: '请填写简介' }
            ],
        };
        let rules = {};
        for (let key in spuRules) {
            rules['spu.' + key] = spuRules[key];
        }
        this.rules = rules;
    }

    saving = false;
    async save() {
        await this.operateHandler('提交', async () => {
            this.saving = true;
            let { spu, specGroup, sku } = this.innerDetail;
            let { imgUrls, ...restSpu } = spu;

            await this.$refs.imgs.upload();
            let saveSku = sku.map(ele => {
                let { imgUrls, ...restSku } = ele;
                return restSku;
            });
            restSpu.imgs = imgUrls.map((ele: FileType) => ele.metadata);
            let saveData = {
                spu: restSpu,
                specGroup,
                sku: saveSku,
            };
            await testApi.goodsMgtSave(saveData);
        }, {
            validate: this.$refs.formVaild.validate,
            onSuccessClose: () => {
                this.$router.push(routerConfig.goodsMgt.path);
            }
        }).finally(() => {
            this.saving = false;
        });
    }

    protected render() {
        return (
            <div>
                <MyLoad
                    loadFn={this.loadDetailData}
                    renderFn={(detail: DetailType) => {
                        return this.renderEdit();
                    }}
                />
            </div>
        );
    }

    private renderEdit() {
        let detail = this.innerDetail;
        let { spu } = detail;
        return (
            <div>
                <Form ref="formVaild" label-position="top" props={{ model: detail }} rules={this.rules}>
                    <FormItem label="名称" prop="spu.name">
                        <Input v-model={spu.name} />
                    </FormItem>
                    <FormItem label="简介" prop="spu.profile">
                        <Input v-model={spu.profile} type="textarea" />
                    </FormItem>
                    <FormItem label="状态" prop="spu.status">
                        <RadioGroup v-model={spu.status}>
                            {myEnum.goodsStatus.toArray().filter(s => s.value !== myEnum.goodsStatus.已删除).map(s => {
                                return <Radio label={s.value}>{s.key}</Radio>
                            })}
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="上架时间" prop="spu.putOnAt">
                        <DatePicker v-model={spu.putOnAt} options={{
                            disabledDate: (date?) => {
                                return date && date.valueOf() < Date.now();
                            },
                        }} />
                    </FormItem>
                    <FormItem label="失效时间" prop="spu.expireAt">
                        <DatePicker v-model={spu.expireAt} options={{
                            disabledDate: (date?) => {
                                return date && date.valueOf() < Date.now();
                            },
                        }} />
                    </FormItem>
                    <FormItem label="图片" prop="spu.imgs">
                        <MyUpload
                            ref='imgs'
                            headers={testApi.defaultHeaders}
                            uploadUrl={testApi.imgUploadUrl}
                            successHandler={(res, file) => {
                                let rs = testApi.uplodaHandler(res);
                                file.url = rs.url;
                                file.metadata = rs.fileId;
                                return rs.fileId;
                            }}
                            format={['jpg', 'png']}
                            width={160} height={90}
                            v-model={spu.imgUrls}
                            maxCount={4}
                        />
                    </FormItem>
                    {this.renderSpecGroup()}
                    {this.renderSku()}
                </Form>
                <Button type="primary" on-click={() => {
                    this.save();
                }}>
                    提交
                </Button>
            </div>
        );
    }

    //渲染规格分组
    private renderSpecGroup() {
        let { specGroup } = this.innerDetail;
        return specGroup.map((g, gIdx) => {
            let groupProp = `specGroup.${gIdx}`;
            return (
                <div>
                    <Row>
                        <Col xs={3}>
                            <FormItem label={'规格' + (gIdx + 1)} prop={groupProp + '.name'}
                                rules={{
                                    required: true, trigger: 'blur',
                                    message: '请填写规格名'
                                }}
                            >
                                <div class={this.getStyleName('spec-group')}>
                                    <Input v-model={g.name} on-on-change={() => {
                                        this.resetSku();
                                    }} />
                                    <Button type="primary" shape="circle" icon="md-add"
                                        on-click={() => {
                                            specGroup.splice(gIdx + 1, 0, { name: '', value: [''] });
                                            this.resetSku();
                                        }}
                                    />
                                    {specGroup.length > 1 && <Button type="error" shape="circle" icon="md-remove"
                                        on-click={() => {
                                            specGroup.splice(gIdx, 1);
                                            this.resetSku();
                                        }}
                                    />}
                                </div>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        {g.value.map((v, vIdx) => {
                            return (
                                <Col xs={6}>
                                    <FormItem prop={groupProp + '.value.' + vIdx}
                                        rules={{
                                            required: true, trigger: 'blur',
                                            message: '请填写值'
                                        }}
                                    >
                                        <div class={this.getStyleName('spec-group')}>
                                            <Input v-model={g.value[vIdx]} on-on-change={() => {
                                                this.resetSku();
                                            }} />
                                            <Button type="primary" shape="circle" icon="md-add"
                                                on-click={() => {
                                                    g.value.splice(vIdx + 1, 0, '');
                                                    this.resetSku();
                                                }}
                                            />
                                            {g.value.length > 1 && <Button type="error" shape="circle" icon="md-remove"
                                                on-click={() => {
                                                    g.value.splice(vIdx, 1);
                                                    this.resetSku();
                                                }}
                                            />}
                                        </div>
                                    </FormItem>
                                </Col>
                            );
                        })}
                    </Row>
                    <Divider size="small" />
                </div>
            )
        });
    }

    private sku: SkuType[] = [];
    private skuCol = [];
    private createSku(specIdx: number, list: SkuType[] = [], spec?: string[]) {
        let { specGroup } = this.innerDetail;
        if (specGroup.length == 0)
            return [];

        specGroup[specIdx].value.forEach(ele => {
            if (specIdx == 0)
                spec = [];
            let lastLv = specIdx + 1 === specGroup.length;
            if (!lastLv)
                spec.push(ele);
            if (specIdx + 1 < specGroup.length)
                this.createSku(specIdx + 1, list, spec);
            else if (lastLv) {
                list.push({
                    quantity: 0,
                    price: 0,
                    spec: [...spec, ele],
                    saleQuantity: 0,
                    imgs: [],
                    imgUrls: [],
                    status: null,
                });
            }
        });
        return list;
    }

    private resetSku() {
        let { specGroup } = this.innerDetail;
        let oldSku = this.sku;
        this.sku = this.createSku(0);
        //赋值到sku
        this.skuCol = [...specGroup.map((ele, idx) => {
            return {
                title: ele.name,
                key: 'specGroup' + idx,
                render: (h, params) => {
                    return (
                        <span>{params.row.spec[idx]}</span>
                    );
                }
            };
        }), {
            title: '价格',
            key: 'price',
            render: (h, params) => {
                return (
                    <Input v-model={params.row.price} type="number" />
                );
            }
        }, {
            title: '数量',
            key: 'quantity',
            render: (h, params) => {
                return (
                    <Input v-model={params.row.quantity} type="number" />
                );
            }
        }, {
            title: '销量',
            key: 'saleQuantity',
        }, {
            title: '状态',
            key: 'status',
            render: (h, params) => {
                return (
                    <Select on-on-change={(v) => {
                        params.row.status = v;
                    }}>
                        {myEnum.goodsSkuStatus.toArray().map(ele => {
                            let opt = <Option value={ele.value} key={ele.value}>{ele.key}</Option>;
                            opt.componentOptions.tag = '';
                            return opt;
                        })}
                    </Select>
                );
            }
        }];
    }

    private renderSku() {
        return (
            <div class={this.getStyleName('sku-main')}>
                <Table columns={this.skuCol} data={this.sku} />
            </div>
        );
    }
}