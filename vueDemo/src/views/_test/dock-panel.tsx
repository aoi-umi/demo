
import { Component, Vue, Watch } from 'vue-property-decorator'

import { MyDockPanel, MyDockPanelItem } from '@/components/my-dock-panel'
import { Base } from '../base'

@Component({})
export default class App extends Base {
  protected stylePrefix = 'test-dock-panel-';

  render () {
    return (
      <MyDockPanel style='width:100%;height:500px'>
        <MyDockPanelItem dock='top' style='background-color: gray;'>
          top
        </MyDockPanelItem>
        <MyDockPanelItem dock='left' style='background-color: rgb(145, 155, 119)'>left</MyDockPanelItem>
        <MyDockPanelItem dock='bottom' style='background-color: #bd9f9f'>bottom</MyDockPanelItem>
        <MyDockPanelItem style='background-color: #96cac3'>rest</MyDockPanelItem>
      </MyDockPanel>
    )
  }
}
