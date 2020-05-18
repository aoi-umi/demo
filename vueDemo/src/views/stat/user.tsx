import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import * as echarts from 'echarts';

import { testSocket, testApi } from '@/api';
import { Divider } from '@/components/iview';

import { Base } from '../base';
import './user.less';

@Component
export default class StatUser extends Base {
    stylePrefix = 'stat-user-';
    $refs: {
        echart: HTMLDivElement;
        pv: HTMLDivElement;
    };
    chart: echarts.ECharts;
    pv: echarts.ECharts;
    total = { ip: 0, pv: 0, uv: 0 };

    mounted() {
        this.chart = echarts.init(this.$refs.echart);
        this.pv = echarts.init(this.$refs.pv);
        this.statQuery();
    }

    statQuery() {
        this.operateHandler('获取数据', async () => {
            let data = await testApi.statQuery();
            this.total = data.total;
            let recently = data.recently;
            let series = [], pvSeries = [];
            Object.entries(recently.data).forEach(obj => {
                let key = obj[0], ele = obj[1];
                let o = {
                    name: key,
                    type: 'line',
                    data: ele
                };
                if (key === 'pv')
                    pvSeries.push(o);
                else
                    series.push(o);
            });
            const optionData: any = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#6a7985'
                        }
                    }
                },
                xAxis: {
                    type: 'category',
                    data: recently.date
                },
                yAxis: {
                    type: 'value'
                },
            };

            this.chart.setOption({
                ...optionData,
                title: {
                    text: 'ip, uv'
                },
                series
            });
            this.pv.setOption({
                ...optionData,
                title: {
                    text: 'pv'
                },
                series: pvSeries
            });
        });
    }

    render() {
        return (
            <div>
                <div class={this.getStyleName('total')}>
                    <div>总览</div>
                    <div class={this.getStyleName('total-content')}>
                        {Object.entries(this.total).map(ele => {
                            return (
                                <div>
                                    <span>{ele[0]}:</span>
                                    <span>{ele[1]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <Divider />
                <div class={this.getStyleName('chart-box')}>
                    <div ref="echart"></div>
                    <div ref="pv"></div>
                </div>
            </div>
        );
    }
}