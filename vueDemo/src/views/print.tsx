import { Component, Vue, Watch } from 'vue-property-decorator'
import 'jquery'

import { Button } from '@/components/iview'

import { Base } from './base'

type ItemGroup = {
  title: string
  items: Item[]
}

type Item = {
  tid: string;
  text: string;
  icon: string;
}
@Component
export default class Print extends Base {
  hiprintTemplate: any
  itemGroups: ItemGroup[] = []
  testData: any = ''
  created () {
    this.createdInit()
  }
  mounted () {
    this.mountedInit()
  }
  createdInit () {
    this.itemGroups = [{
      title: '拖拽列表',
      items: [{
        tid: 'testModule.text',
        text: '文本',
        icon: 'glyphicon-text-width'
      }, {
        tid: 'testModule.image',
        text: '图片',
        icon: 'glyphicon-picture'
      }, {
        tid: 'testModule.longText',
        text: '长文',
        icon: 'glyphicon-subscript'
      },
      // {
      //   tid: 'testModule.table',
      //   text: '表格',
      //   icon: 'glyphicon-th'
      // },
      {
        tid: 'testModule.tableCustom',
        text: '表格',
        icon: 'glyphicon-th'
      },
      {
        tid: 'testModule.html',
        text: 'html',
        icon: 'glyphicon-header'
      }]
    }, {
      title: '辅助',
      items: [{
        tid: 'testModule.hline',
        text: '横线',
        icon: 'glyphicon-resize-horizontal'
      }, {
        tid: 'testModule.vline',
        text: '竖线',
        icon: 'glyphicon-resize-vertical'
      }, {
        tid: 'testModule.rect',
        text: '矩形',
        icon: 'glyphicon-unchecked'
      }, {
        tid: 'testModule.oval',
        text: '椭圆',
        icon: 'glyphicon-record'
      }]
    }]
    this.testData = JSON.stringify({
      name: 'vue',
      table: [{
        col1: '1',
        col2: '2',
        col3: '3'
      }]
    })
  }
  async mountedInit () {
    await this.getScript()
    hiprint.init({
      providers: [new customElementTypeProvider()],
      paginationContainer: '.hiprint-printPagination'
    })
    let hiprintTemplate
    // 设置左侧拖拽事件
    let template = { 'panels': [{ 'index': 0, 'paperType': 'A4', 'height': 297, 'width': 210, 'paperHeader': 0, 'paperFooter': 841.8897637795277, 'printElements': [{ 'options': { 'left': 27, 'top': 30, 'height': 9.75, 'width': 33, 'title': 'hello,' }, 'printElementType': { 'type': 'text' }}, { 'options': { 'left': 57, 'top': 30, 'height': 12, 'width': 121.5, 'field': 'name', 'testData': 'world' }, 'printElementType': { 'type': 'text' }}, { 'options': { 'left': 12, 'top': 103.5, 'height': 36, 'width': 550, 'field': 'table', 'columns': [[{ 'title': '列1', 'field': 'col1', 'width': 232.69230769230768, 'colspan': 1, 'rowspan': 1, 'checked': true }, { 'title': '列2', 'field': 'col2', 'width': 162.6925576923077, 'colspan': 1, 'rowspan': 1, 'checked': true }, { 'title': '列3', 'field': 'col3', 'width': 154.6151346153846, 'colspan': 1, 'rowspan': 1, 'checked': true }]] }, 'printElementType': { 'title': '表格', 'type': 'tableCustom' }}] }] }
    hiprint.PrintElementTypeManager.buildByHtml($('.ep-draggable-item'))
    this.hiprintTemplate = hiprintTemplate = new hiprint.PrintTemplate({
      template,
      settingContainer: '#PrintElementOptionSetting',
      paginationContainer: '.hiprint-printPagination'
    })
    // 打印设计
    hiprintTemplate.design('#hiprint-printTemplate')

    $('#A4_directPrint').click(() => {
      try {
        let testData = JSON.parse(this.testData)
        hiprintTemplate.print(testData)
      } catch (e) {
        this.$Message.error(e.message)
      }
    })
  }
  async getScript () {
    let scripts = [
      'hiprint/polyfill.min.js',
      'hiprint/plugins/jquery.minicolors.min.js',
      'hiprint/plugins/JsBarcode.all.min.js',
      'hiprint/plugins/qrcode.js',
      'hiprint/hiprint.bundle.js',
      'hiprint/custom_test/config-etype-provider.js',
      'hiprint/custom_test/custom-etype-provider.js',
      'hiprint/plugins/jquery.hiwprint.js'
      // 'https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/js/bootstrap.min.js'
    ]
    await this.loadScript(scripts)
  }
  loadScript (list: string[]) {
    return Promise.all(list.map(ele => {
      let resolve, reject
      let promise = new Promise((reso, rej) => {
        resolve = reso
        reject = rej
      })
      $.getScript(ele, (response, status) => {
        resolve()
      })
      return promise
    }))
  }

  // 调整纸张
  setPaper (paperTypeOrWidth, height?) {
    let { hiprintTemplate } = this
    hiprintTemplate.setPaper(paperTypeOrWidth, height)
  }

  // 旋转
  rotatePaper () {
    let { hiprintTemplate } = this
    hiprintTemplate.rotatePaper()
  }
  clearTemplate () {
    let { hiprintTemplate } = this
    hiprintTemplate.clear()
  }

  render () {
    return (
      <div>
        {this.renderImport()}
        <div style='display:flex'>
          <div class='row'>
            <div class='col-sm-3 col-md-2' style='padding-right:0px;'>

              <div class='rect-printElement-types hiprintEpContainer'>

                <ul class='hiprint-printElement-type'>
                  {this.itemGroups.map(ele => {
                    return (
                      <li>
                        <span class='title'><code>{ele.title}</code></span>
                        <ul>
                          {ele.items.map(item => {
                            return (
                              <li>
                                <a class='ep-draggable-item' tid={item.tid} style=''>
                                  <span class={['glyphicon', item.icon]} aria-hidden='true'></span>
                                  <span class='glyphicon-class'>{item.text}</span>
                                </a>
                              </li>
                            )
                          })}
                        </ul>
                      </li>
                    )
                  })}
                </ul>
              </div>

            </div>
            <div class='col-sm-9 col-md-10'>
              <div class='hiprint-toolbar' style='margin-top:15px;'>
                <ul>
                  {[
                    'A3', 'A4', 'A5',
                    'B3', 'B4', 'B5'
                  ].map(ele => {
                    return (
                      <li><a class='hiprint-toolbar-item' on-click={() => {
                        this.setPaper(ele)
                      }}>{ele}</a></li>
                    )
                  })}

                  <li><a class='hiprint-toolbar-item'><input type='text' id='customWidth' style='width: 50px;height: 19px;border: 0px;' placeholder='宽/mm' /></a></li>
                  <li><a class='hiprint-toolbar-item'><input type='text' id='customHeight' style='width: 50px;height: 19px;border: 0px;' placeholder='高/mm' /></a></li>

                  <li><a class='hiprint-toolbar-item' on-click={() => {
                    let width = $('#customWidth').val()
                    let height = $('#customHeight').val()
                    if (!width || isNaN(width) || !height || isNaN(height)) { return this.$Message.warning('请输入正确的宽高') }
                    this.setPaper(width, height)
                  }}>自定义</a></li>
                  <li><a class='hiprint-toolbar-item' on-click={this.rotatePaper}>旋转</a></li>
                  <li><a class='hiprint-toolbar-item' on-click={this.clearTemplate}>清空</a></li>

                  {/* <li>
                    <a id='A4_preview' class='btn hiprint-toolbar-item ' style='color: #fff;background-color: #d9534f;border-color: #d43f3a;' >快速预览</a>
                  </li> */}
                  <li>
                    <a id='A4_directPrint' class='btn hiprint-toolbar-item ' style='color: #fff;background-color: #d9534f; border-color: #d43f3a;'>打印</a>
                  </li>
                  <li><a class='hiprint-toolbar-item' on-click={() => {
                    console.log(this.hiprintTemplate.getJson())
                  }}>json</a></li>

                </ul>
                <div style='clear:both;'></div>
              </div>
              <div class='hiprint-printPagination'></div>
              <div style='width:820px;overflow-x:auto;overflow-y:hidden;'>
                <div id='hiprint-printTemplate' class='hiprint-printTemplate' style='margin-top:20px;'>
                </div>

              </div>
            </div>
          </div>

          <div style='width:250px'>
            <div>测试数据</div>
            <textarea v-model={this.testData}>
            </textarea>
            <div id='PrintElementOptionSetting' style='margin-top:10px;'></div>
          </div>
        </div>
      </div>
    )
  }
  renderImport () {
    return (
      <div>
        <link href='hiprint/css/hiprint.css' rel='stylesheet' />
        <link href='hiprint/css/print-lock.css' rel='stylesheet' />

        <link href='https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css' rel='stylesheet' />

        {/* <script src='hiprint/polyfill.min.js'></script> */}
        {/* <script src='hiprint/plugins/jquery.minicolors.min.js'></script> */}
        {/* <script src='hiprint/plugins/JsBarcode.all.min.js'></script> */}
        {/* <script src='hiprint/plugins/qrcode.js'></script> */}
        {/* <script src='hiprint/hiprint.bundle.js'></script> */}
        {/* <script src='hiprint/plugins/jquery.hiwprint.js'></script> */}
        {/* <script src='https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/js/bootstrap.min.js'></script> */}
      </div>
    )
  }
}
