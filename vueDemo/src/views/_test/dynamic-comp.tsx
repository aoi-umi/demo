
import { Component, Vue, Watch } from 'vue-property-decorator'

import { Input, Card, Button, Checkbox, Row, Col, Select, Option, Form, FormItem } from '@/components/iview'

import { DynamicComp, DynamicCompType, DynamicCompConfigType } from '../comps/dynamic-comp'
import { Base } from '../base'
import { MyList } from '@/components/my-list'

@Component({})
export default class App extends Base {
  configList: DynamicCompConfigType[] = []
  data = {}
  selectRow: DynamicCompConfigType = null
  editable = true

  extraValue = {
    options: [{
      label: '选项1',
      value: 'option1'
    }]
  }
  created () {
    this.configList = Object.entries(DynamicCompType).map(ele => {
      let name = ele[1]
      let text = ele[0]
      return {
        name,
        text,
        type: name,
        isRange: false,
        options: 'options'
      }
    })
    this.setData()
  }
  test () {
    this.extraValue.options = [{
      label: '选项2',
      value: 'option2'
    }, {
      label: '选项1',
      value: 'option1'
    }]
  }

  setData () {
    let data = {}
    this.configList.forEach(ele => {
      data[ele.name] = null
    })
    data['select'] = 'option1'
    this.data = data
  }

  render () {
    return (
      <div>
        <span>动态组件</span>
        <Row gutter={5}>
          <Col xs={12}>
            <MyList
              tableHeight={200}
              columns={[{
                key: 'name',
                render: (h, params) => {
                  return (<div on-click={() => {
                    this.selectRow = this.configList[params['index']]
                  }}>{params.row.name}</div>)
                }
              }, {
                key: 'op',
                title: '删除',
                render: (h, params) => {
                  return (<div>
                    <a on-click={() => {
                      this.configList.splice(params['index'], 1)
                    }}>删除</a>
                  </div>)
                }
              }]}
              data={this.configList}
              hideSearchBox
              hidePage
            >
              <Button on-click={() => {
                this.configList.push({
                  name: 'unknow',
                  text: '未命名',
                  type: 'input'
                })
              }}>新增</Button>
            </MyList>
          </Col>
          <Col xs={12}>
            <div>
              <Checkbox v-model={this.editable}>可编辑</Checkbox>

              <Button on-click={() => {
                this.test()
                console.log(this.data)
              }}>test</Button>
            </div>
            {this.renderSetting()}
          </Col>
        </Row>
        <div>
          <Row>
            {this.configList.map(ele => {
              return (
                <Col xs={6}>
                  <DynamicComp style='margin: 0 5px 5px 0'
                    config={ele}
                    data={this.data}
                    showText
                    editable={this.editable}
                    readonlyType='disabled'
                    extraValue={this.extraValue}
                  />
                </Col>
              )
            })}
          </Row>
        </div>
      </div>
    )
  }

  renderSetting () {
    if (!this.selectRow) return <div />
    return (
      <Form label-width={50} show-message={false}>
        <FormItem label='name'>
          <Input v-model={this.selectRow.name} on-on-change={() => {
            this.setData()
          }}>
          </Input>
        </FormItem>
        <FormItem label='text'>
          <Input v-model={this.selectRow.text}>
          </Input>
        </FormItem>
        <FormItem label='type'>
          <Select v-model={this.selectRow.type}>
            {this.$utils.obj2arr(DynamicCompType).map(ele => {
              return (
                <i-option key={ele.key} value={ele.value}>
                  {ele.key}
                </i-option>
              )
            })}
          </Select>
        </FormItem>

        <FormItem label='isRange'>
          <Checkbox v-model={this.selectRow.isRange} />
        </FormItem>
      </Form>
    )
  }
}
