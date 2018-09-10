import * as $ from 'jquery';
import * as echarts from 'echarts';
import 'bootstrap-datetimepicker';
import * as common from './common';
import * as myInterface from './myInterface';

export class LogStatistics {
    dom: JQuery<HTMLElement>;
    echart: echarts.ECharts;
    queryBoxId: string;

    constructor(option?) {
        let self = this;
        let opt = {
            id: 'logStatistics'
        };
        opt = $.extend(opt, option);
        self.queryBoxId = '#' + opt.id;
        this.dom = $(`${self.queryBoxId}`);
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

        let currMonth = new Date(common.dateFormat(new Date(), 'yyyy-MM-01'));
        $(`${self.queryBoxId} [name=createDateStart]`).val(common.dateFormat(currMonth));
        $(`${self.queryBoxId} [name=createDateEnd]`).val(common.dateFormat(currMonth.getTime() + 30 * 86400 * 1000));
        this.bindEvent();

        this.dom.find('[name=refresh]').trigger('click');
    }

    bindEvent() {
        let self = this;
        let msgDom = this.dom.find('[name=msg]');
        let minDate = '1900-01-01';
        let maxDate = '9999-12-31';
        let dateOpt = {
            format: 'yyyy-mm-dd',
            minView: 'month',
            autoclose: true,
            todayBtn: true,
            clearBtn: true,
            startDate: minDate,
        };
        this.dom.on('click', '[name=refresh]', function () {
            msgDom.text('');
            let echartsOpt: echarts.EChartOption = self.echart.getOption();
            let createDateStart = ($(`${self.queryBoxId} [name=createDateStart]`).val() as string).trim() || null;
            let createDateEnd = ($(`${self.queryBoxId} [name=createDateEnd]`).val() as string).trim() || null;
            if (createDateEnd)
                createDateEnd += ' 23:59:59';
            let data = {
                createDateStart,
                createDateEnd,
            };
            myInterface.api.logStatistics(data).then(t => {
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
        $(`${self.queryBoxId} [name=createDateStart]`)
            .datetimepicker(dateOpt)
            .on('click', function () {
                $(this).datetimepicker('setEndDate', $(`${self.queryBoxId} [name=createDateEnd]`).val() || maxDate);
            });
        $(`${self.queryBoxId} [name=createDateEnd]`)
            .datetimepicker(dateOpt)
            .on('click', function () {
                $(this).datetimepicker('setStartDate', $(`${self.queryBoxId} [name=createDateStart]`).val() || minDate);
            });
    }
}