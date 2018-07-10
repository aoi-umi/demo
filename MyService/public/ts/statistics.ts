import * as $ from 'jquery';
import * as echarts from 'echarts';
import * as common from './common';
import * as myInterface from './myInterface';

export class LogStatistics {
    dom: JQuery<HTMLElement>;
    echart: echarts.ECharts;
    constructor(option?) {
        let opt = {
            id: 'logStatistics'
        };
        opt = $.extend(opt, option);
        this.dom = $(`#${opt.id}`);
        let chart = this.dom.find('[name=chart]');
        let echartsOpt = {
            // 给echarts图设置背景色
            backgroundColor: '#FBFBFB',
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    let data = common.dateFormat(params[0].value[0]) + '<br/>';
                    for (let i = 0; i < params.length; i++) {
                        data += params[i].marker + params[i].seriesName + ': '
                            + params[i].value[1] + ', '
                            + params[i].value[3] + '<br/>';
                    }
                    return data;
                }
            },
            dataZoom: [{
                id: 'dataZoomX',
                type: 'slider',
                xAxisIndex: [0],
                filterMode: 'filter'
            },],
            legend: {
                data: []
            },
            calculable: true,
            xAxis: [{
                type: 'time',
                // boundaryGap: false,
                data: []
            }],
            yAxis: [{
                type: 'value',
                boundaryGap: ['0%', '20%']
            }],
            series: []
        };
        let echart = this.echart = echarts.init(chart[0] as HTMLDivElement);
        echart.setOption(echartsOpt);

        this.bindEvent();

        this.dom.find('[name=refresh]').trigger('click');
    }

    bindEvent() {
        let self = this;
        let msgDom = this.dom.find('[name=msg]');
        this.dom.find('[name=refresh]').on('click', function () {
            msgDom.text('');
            let echartsOpt: echarts.EChartOption = self.echart.getOption();
            myInterface.api.logStatistics().then(t => {
                let list = [];
                let dataDict = {};
                t.list.forEach(ele => {
                    let data = dataDict[ele.method] || (dataDict[ele.method] = []);
                    let notSuccessCount = ele.count - ele.successCount;
                    let notSuccessRate = parseFloat((notSuccessCount / ele.count).toFixed(2));
                    data.push([new Date(ele.date), notSuccessRate, notSuccessCount, `(${notSuccessCount}/${ele.count})`]);
                });
                for (let method in dataDict) {
                    list.push({
                        name: method,
                        type: 'line',
                        data: dataDict[method],
                        symbolSize: function (value) {
                            return value[2];
                        },
                    });
                    // list.push({
                    //     name: method,
                    //     type: 'bar',
                    //     data: dataDict[method],
                    // });
                }

                echartsOpt.series = list;
                self.echart.setOption(echartsOpt);
            }).catch(e => {
                msgDom.text(e.message);
            });
        });
    }
}