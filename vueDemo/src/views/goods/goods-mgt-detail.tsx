import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import moment from 'dayjs';
import * as iview from 'iview';

import { dev, myEnum, authority } from '@/config';
import { testApi } from '@/api';
import { routerConfig } from '@/router';
import { Form, FormItem, Input, Row, Col, Button, Divider } from '@/components/iview';
import MyLoadView from '@/components/my-load/my-load';

import { Base } from '../base';

import './goods.less';

type DetailType = {
    spu: any;
    sku: any[];
    specGroup: SpecGroupType[];
};

type SpecGroupType = { name: string, value: string[] };

@Component
export default class GoodsMgtDetail extends Base {
    stylePrefix = "goods-mgt-"
    $refs: { formVaild: iview.Form };
    private innerDetail: DetailType = this.getDetailData();
    private preview = false;
    protected getDetailData() {
        let data = {
            spu: {
                name: '',
                status: myEnum.goodsStatus.上架,
                statusText: ''
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

            if (query.repost) {
                detail.spu._id = '';
            }
        } else {
            detail = this.getDetailData() as any;
        }
        this.innerDetail = detail;
        this.setRules();
        return detail;
    }

    rules = {};
    private setRules() {
        let spuRules = {
            name: [
                { required: true, trigger: 'blur', message: '请填写名称' }
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
        }, {
            validate: this.$refs.formVaild.validate
        }
        ).finally(() => {
            this.saving = false;
        });
    }

    //渲染规格分组
    private renderSpecGroup(specGroup: SpecGroupType[]) {
        return specGroup.map((g, gIdx) => {
            let groupProp = `specGroup.${gIdx}`;
            return (
                <div>
                    <Row>
                        <Col xl={6}>
                            <FormItem label={'规格' + (gIdx + 1)} prop={`${groupProp}.name`}
                                rules={{
                                    required: true, trigger: 'blur',
                                    message: '请填写规格名'
                                }}
                            >
                                <div class={this.getStyleName('spec-group')}>
                                    <Input v-model={g.name} />
                                    <Button type="primary" shape="circle" icon="md-add"
                                        on-click={() => {
                                            specGroup.splice(gIdx + 1, 0, { name: '', value: [''] });
                                        }}
                                    />
                                    {specGroup.length > 1 && <Button type="error" shape="circle" icon="md-remove"
                                        on-click={() => {
                                            specGroup.splice(gIdx, 1);
                                        }}
                                    />}
                                </div>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        {g.value.map((v, vIdx) => {
                            return (
                                <Col xl={6}>
                                    <FormItem prop={`${groupProp}.value.${vIdx}`}
                                        rules={{
                                            required: true, trigger: 'blur',
                                            message: '请填写值'
                                        }}
                                    >
                                        <div class={this.getStyleName('spec-group')}>
                                            <Input v-model={g.value[vIdx]} />
                                            <Button type="primary" shape="circle" icon="md-add"
                                                on-click={() => {
                                                    g.value.splice(vIdx + 1, 0, '');
                                                }}
                                            />
                                            {g.value.length > 1 && <Button type="error" shape="circle" icon="md-remove"
                                                on-click={() => {
                                                    g.value.splice(vIdx, 1);
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

    protected render() {
        return (
            <div>
                <MyLoadView
                    loadFn={this.loadDetailData}
                    renderFn={(detail: DetailType) => {
                        return (
                            <div>
                                <Form ref="formVaild" label-position="top" props={{ model: detail }} rules={this.rules}>
                                    <FormItem label="名称" prop="spu.name">
                                        <Input v-model={detail.spu.name} />
                                    </FormItem>
                                    {this.renderSpecGroup(detail.specGroup)}
                                </Form>
                                <Button type="primary" on-click={() => {
                                    this.save();
                                }}>
                                    提交
                                </Button>
                            </div>
                        );
                    }}
                />
            </div>
        );
    }
}