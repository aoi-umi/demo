import { Component, Vue, Watch } from 'vue-property-decorator'

import { Prop } from '@/components/property-decorator'
import { Button, Row, Col, Modal } from '../iview'
import { convClass, getCompOpts, getInstCompName } from '../utils'
import { MyBase } from '../my-base'

import './style.less'

class MyDockPanelProp {
}
@Component({
  extends: MyBase,
  mixins: [getCompOpts(MyDockPanelProp)]
})
class MyDockPanelModel extends Vue<MyDockPanelProp & MyBase> {
  stylePrefix = 'my-dock-panel-';

  getDock (ele) {
    let propsData = ele.componentOptions.propsData
    let dock = propsData.dock || 'top'
    let direction = ['left', 'right'].includes(dock) ? 'row' : 'column'
    return {
      dock,
      direction
    }
  }

  render () {
    let items = this.$slots.default.filter(ele => {
      return getInstCompName(ele) === 'MyDockPanelItem'
    })
    console.log(items)
    let newItem
    items.reverse().forEach((ele, idx) => {
      let { direction, dock } = this.getDock(ele)
      let style = ''
      if (idx === items.length - 1) { style = 'width:100%;height:100%' }
      newItem = (
        <div class={this.getStyleName('wrap', 'stretch', direction)} style={style}>
          {['bottom', 'right'].includes(dock) && newItem}
          <div class={this.getStyleName('child', idx == 0 && 'stretch')}>{ele}</div>
          {['left', 'top'].includes(dock) && newItem}
        </div>)
    })
    return (
      <div>
        {newItem}
      </div>
    )
  }
}

export const MyDockPanel = convClass<MyDockPanelProp>(MyDockPanelModel)

class MyDockPanelItemProp {
  @Prop()
  dock?: 'top' | 'bottom' | 'left' | 'right'

  @Prop()
  width?: string;

  @Prop()
  height?: string;
}
@Component({
  name: 'MyDockPanelItem',
  extends: MyBase,
  mixins: [getCompOpts(MyDockPanelItemProp)]
})
class MyDockPanelItemModel extends Vue<MyDockPanelItemProp & MyBase> {
  stylePrefix = 'my-dock-panel-item-';

  render () {
    return (
      <div class={this.getStyleName('root')}>
        {this.$slots.default}
      </div>
    )
  }
}

export const MyDockPanelItem = convClass<MyDockPanelItemProp>(MyDockPanelItemModel)

