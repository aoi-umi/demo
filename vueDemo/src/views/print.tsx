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
  }
  async mountedInit () {
    await this.getScript()
    hiprint.init({
      providers: [new customElementTypeProvider()]
    })
    let hiprintTemplate
    // 设置左侧拖拽事件
    hiprint.PrintElementTypeManager.buildByHtml($('.ep-draggable-item'))
    this.hiprintTemplate = hiprintTemplate = new hiprint.PrintTemplate({
      settingContainer: '#PrintElementOptionSetting',
      paginationContainer: '.hiprint-printPagination'
    })
    // 打印设计
    hiprintTemplate.design('#hiprint-printTemplate')

    $('#A4_directPrint').click(function () {
      hiprintTemplate.print([{ table: [{ a: 1, b: 2, c: 3 }] }, {}])
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
      'hiprint/plugins/jquery.hiwprint.js',
      'https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/js/bootstrap.min.js'
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

                  <li>
                    <a id='A4_preview' class='btn hiprint-toolbar-item ' style='color: #fff;background-color: #d9534f;border-color: #d43f3a;' >快速预览</a>
                  </li>
                  <li>
                    <a id='A4_directPrint' class='btn hiprint-toolbar-item ' style='color: #fff;background-color: #d9534f; border-color: #d43f3a;'>打印</a>
                  </li>
                  <li><a class='hiprint-toolbar-item' on-click={() => {
                    console.log(this.hiprintTemplate.getJson())
                  }}>json</a></li>

                </ul>
                <div style='clear:both;'></div>
              </div>
              <div style='width:820px;overflow-x:auto;overflow-y:hidden;'>
                <div id='hiprint-printTemplate' class='hiprint-printTemplate' style='margin-top:20px;'>
                </div>

              </div>
            </div>
          </div>

          <div style='width:250px'>
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
}
