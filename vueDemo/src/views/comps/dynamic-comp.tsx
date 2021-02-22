import { Component, Vue, Watch } from 'vue-property-decorator'

import { convClass, getCompOpts } from '@/components/utils'
import { Prop } from '@/components/property-decorator'
import { Input, Select } from '@/components/iview'

import { Base } from '../base'

export const DynamicCompType = {
  输入框: 'input',
  选择器: 'select'
}

class DynamicCompProp {
  @Prop({
    required: true
  })
  config: {
    name: string
    text: string
    type: string
  }

  @Prop({
    required: true
  })
  data: any
}

@Component({
  extends: Base,
  mixins: [getCompOpts(DynamicCompProp)]
})
class DynamicComp extends Vue<DynamicCompProp & Base> {
  render () {
    return (<div>{this.renderComp()}</div>)
  }

  renderComp () {
    let { data, config } = this

    if (config.type === DynamicCompType.选择器) {
      return (
        <Select v-model={data[config.name]} allow-create filterable></Select>
      )
    }

    return (
      <Input v-model={data[config.name]}></Input>
    )
  }
}

export const DynamicCompView = convClass<DynamicCompProp>(DynamicComp)
