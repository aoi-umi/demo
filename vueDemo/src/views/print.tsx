import { Component, Vue, Watch } from 'vue-property-decorator'

import { Button, Input } from '@/components/iview'
import { IMyLoad, MyLoad } from '@/components/my-load'
import { testApi } from '@/api'

import { Base } from './base'
import './print.less'

type ItemGroup = {
  title: string
  items: Item[]
}

type Item = {
  tid: string;
  text: string;
  icon: string;
}

type DetailDataType = {
  _id?: string;
  name?: string;
  data?: any
};
@Component
export default class Print extends Base {
  stylePrefix = 'print-'
  $refs: { loadView: IMyLoad };
  hiprintTemplate: any
  itemGroups: ItemGroup[] = []
  testData: any = ''
  detail: DetailDataType = this.getDetailData()
  initPromise: Promise<void>;
  created () {
    this.createdInit()
  }
  mounted () {
  }

  @Watch('$route')
  route (to, from) {
    this.$refs.loadView.loadData()
  }

  private getDetailData () {
    return {
      _id: null,
      name: '',
      data: null
    }
  }
  async createdInit () {
    this.initPromise = new Promise(async (resolve, reject) => {
      await this.getScript()
      resolve()
    })

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

  setTestData (obj?) {
    this.testData = JSON.stringify(obj || {})
  }

  getTestData () {
    return JSON.parse(this.testData)
  }

  async afterLoad () {
    await this.initPromise
    hiprint.init({
      providers: [new customElementTypeProvider()],
      paginationContainer: '.hiprint-printPagination'
    })

    // 设置左侧拖拽事件
    hiprint.PrintElementTypeManager.buildByHtml($('.ep-draggable-item'))

    $('#A4_directPrint').click(() => {
      try {
        let testData = this.getTestData()
        this.hiprintTemplate.print(testData)
      } catch (e) {
        this.$Message.error(e.message)
      }
    })

    let testData = {
      name: 'vue',
      table: [{
        col1: '1',
        col2: '2',
        col3: '3'
      }]
    }
    if (this.detail._id) { testData = null }
    this.setTestData(testData)
    this.setTemplate(this.detail.data)
  }

  async setTemplate (template) {
    await this.initPromise
    let hiprintTemplate = this.hiprintTemplate = new hiprint.PrintTemplate({
      template,
      settingContainer: '#PrintElementOptionSetting',
      paginationContainer: '.hiprint-printPagination'
    })
    // 打印设计
    $('#hiprint-printTemplate').html('')
    hiprintTemplate.design('#hiprint-printTemplate')
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
    await this.$utils.loadScript(scripts)
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

  async loadDetail () {
    const query = this.$route.query
    let detail: DetailDataType
    if (query._id) {
      detail = await testApi.printMgtDetailQuery({ _id: query._id })
    } else {
      detail = this.getDetailData() as any
      detail.data = { 'panels': [{ 'index': 0, 'paperType': 'A4', 'height': 297, 'width': 210, 'paperHeader': 0, 'paperFooter': 841.8897637795277, 'printElements': [{ 'options': { 'left': 27, 'top': 30, 'height': 9.75, 'width': 33, 'title': 'hello,' }, 'printElementType': { 'type': 'text' }}, { 'options': { 'left': 57, 'top': 30, 'height': 12, 'width': 121.5, 'field': 'name', 'testData': 'world' }, 'printElementType': { 'type': 'text' }}, { 'options': { 'left': 12, 'top': 103.5, 'height': 36, 'width': 550, 'field': 'table', 'columns': [[{ 'title': '列1', 'field': 'col1', 'width': 232.69230769230768, 'colspan': 1, 'rowspan': 1, 'checked': true }, { 'title': '列2', 'field': 'col2', 'width': 162.6925576923077, 'colspan': 1, 'rowspan': 1, 'checked': true }, { 'title': '列3', 'field': 'col3', 'width': 154.6151346153846, 'colspan': 1, 'rowspan': 1, 'checked': true }]] }, 'printElementType': { 'title': '表格', 'type': 'tableCustom' }}] }] }
    }

    this.detail = detail
    return detail
  }

  saving = false
  save () {
    this.operateHandler('保存', async () => {
      this.saving = true
      let saveData = {
        ...this.detail,
        data: this.hiprintTemplate.getJson()
      }
      let rs = await testApi.printMgtSave(saveData)
      if (!this.detail._id) { this.detail._id = rs._id }
    }).finally(() => {
      this.saving = false
    })
  }

  render () {
    return (
      <MyLoad
        ref='loadView'
        loadFn={this.loadDetail}
        renderFn={() => {
          return this.renderMain()
        }}
        afterLoad={this.afterLoad}
        v-loading={this.saving}
      />
    )
  }

  renderMain () {
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
                    <a id='A4_directPrint' class={['btn hiprint-toolbar-item ', ...this.getStyleName('important-btn')]} >打印</a>
                  </li>
                  <li><a class={['btn hiprint-toolbar-item ', ...this.getStyleName('important-btn')]} on-click={() => {
                    this.save()
                  }}>保存</a></li>

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
            <div>
              <div>模板名称</div>
              <Input v-model={this.detail.name} />
            </div>
            <div>
              <div>测试数据</div>
              <textarea v-model={this.testData}>
              </textarea>
            </div>
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
