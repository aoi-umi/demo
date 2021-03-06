import * as $ from 'jquery';
import * as echarts from 'echarts';
import 'bootstrap-datetimepicker';
import * as moment from 'moment';
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

        let currMonth = moment().format('YYYY-MM-01');
        $(`${self.queryBoxId} [name=createDateStart]`).val(currMonth);
        $(`${self.queryBoxId} [name=createDateEnd]`).val(moment(currMonth).add({ month: 1, day: -1 }).format('YYYY-MM-DD'));
        this.bindEvent();

        this.dom.find('[name=refresh]').trigger('click');
    }

    bindEvent() {
        let self = this;
        let msgDom = this.dom.find('[name=msg]');
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
                let dataDict: { [key: string]: any[] } = {};
                t.list.forEach(ele => {
                    let data = dataDict[ele.method] || (dataDict[ele.method] = []);
                    let notSuccessCount = ele.count - ele.successCount;
                    let notSuccessRate = parseFloat((notSuccessCount / ele.count).toFixed(2));
                    data.push([new Date(ele.date), notSuccessRate, notSuccessCount, `(${notSuccessCount}/${ele.count})`]);
                });
                //填0
                for (let method in dataDict) {
                    let first = moment(dataDict[method][0][0]);
                    let last = moment({ hour: 0 }).add({ day: 1 });
                    let newData = [];
                    while (first.toDate().getTime() < last.toDate().getTime()) {
                        let match = dataDict[method].find(ele => ele[0].getTime() == first.toDate().getTime());
                        if (match)
                            newData.push(match);
                        else
                            newData.push([first.toDate(), 0, 0, '(0/0)']);
                        first.add({ day: 1 });
                    }
                    dataDict[method] = newData;
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