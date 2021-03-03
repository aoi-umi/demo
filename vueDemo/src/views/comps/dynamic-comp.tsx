import { Component, Vue, Watch } from 'vue-property-decorator'

import { convClass, getCompOpts } from '@/components/utils'
import { Prop } from '@/components/property-decorator'
import {
  Input,
  Select,
  Checkbox,
  InputNumber,
  DatePicker,
  TimePicker
} from '@/components/iview'

import { Base } from '../base'
import './dynamic-comp.less'

export const DynamicCompType = {
  输入框: 'input',
  数字输入框: 'input-number',
  选择器: 'select',
  多选框: 'checkbox',
  日期: 'date',
  时间: 'time',
  日期时间: 'datetime'
}

export const DynamicCompStringQueryType = {
  模糊: 'like',
  左模糊: 'left-like',
  右模糊: 'right-like',
  等于: 'eq'
}

export const DynamicCompNumQueryType = {
  大于: '>',
  大于等于: '>=',
  小于: '<',
  小于等于: '<=',
  等于: '=',
  不等于: '!='
}

type SelectOptionType = { label: string; value: any };

export type DynamicCompConfigType = {
  name: string;
  text: string;
  // 组件类型
  type?: string;
  // 是否区间
  isRange?: boolean;
  rangeSeparator?: string;
  options?: string | SelectOptionType[] | ((query: string) => Promise<SelectOptionType[]>);
};
class DynamicCompProp {
  @Prop({
    required: true
  })
  config: DynamicCompConfigType;

  @Prop({
    required: true
  })
  data: any;

  @Prop()
  showText?: boolean;

  @Prop({
    default: true
  })
  editable?: boolean;

  @Prop({
    default: 'text'
  })
  readonlyType?: 'disabled' | 'text'

  @Prop()
  extraValue?: Object
}

@Component({
  extends: Base,
  mixins: [getCompOpts(DynamicCompProp)]
})
class DynamicCompModel extends Vue<DynamicCompProp & Base> {
  stylePrefix = 'comp-dynamic-comp-';
  created () {
  }
  render () {
    return (
      <div>
        {this.showText && this.config.text}
        <div class={this.getStyleName('container')}>{this.renderComp()}</div>
      </div>
    )
  }

  private loading = false

  private get selectOptions () {
    let { config, data } = this
    if (typeof config.options === 'function') {
      return this.remoteSelectOptions
    } else if (typeof config.options === 'string') {
      return this.extraValue[config.options]
    } else { return config.options }
  }
  private remoteSelectOptions: SelectOptionType[] = []

  private get actuallyEditable () {
    return this.editable
  }
  private get isDate () {
    let { config } = this
    return [DynamicCompType.日期, DynamicCompType.日期时间].includes(config.type)
  }
  renderText ({ rangeSeparator }) {
    let { data, config } = this

    let val = data[config.name]
    let showValue = val
    if (config.type === DynamicCompType.选择器) {
      let match = this.selectOptions.find(ele => ele.value == val)
      if (match) showValue = match.label
    }
    if (this.isDate) {
      let fmt = {
        [DynamicCompType.日期]: 'date',
        [DynamicCompType.日期时间]: 'datetime'
      }[config.type]
      showValue = ''
      if (val) {
        let list = val instanceof Array ? val : [val]
        showValue = list.map(ele => this.$utils.dateFormat(ele, fmt))
      }
    }
    if (showValue instanceof Array) { showValue = showValue.join(` ${rangeSeparator} `) }
    return showValue
  }
  renderComp () {
    let { data, config } = this
    let rangeSeparator = config.rangeSeparator || '-'

    if (this.readonlyType === 'text' && !this.actuallyEditable) {
      return this.renderText({
        rangeSeparator
      })
    }

    if (config.type === DynamicCompType.选择器) {
      let isFn = typeof config.options === 'function'
      let method: any = !isFn ? null : (query) => {
        this.setSelectOption({
          query
        })
      }
      return (
        <Select v-model={data[config.name]} filterable loading={this.loading} remote-method={method} disabled={!this.actuallyEditable}>
          {this.selectOptions?.map((ele) => {
            return <i-option value={ele.value} key={ele.label}>{ele.label}</i-option>
          })}
        </Select>
      )
    }

    if (config.type === DynamicCompType.多选框) {
      return <Checkbox v-model={data[config.name]} disabled={!this.actuallyEditable}/>
    }

    if (this.isDate) {
      let type = {
        [DynamicCompType.日期]: 'date',
        [DynamicCompType.日期时间]: 'datetime'
      }[config.type] as any
      if (config.isRange) type += 'range'
      return <DatePicker type={type} v-model={data[config.name]} disabled={!this.actuallyEditable}/>
    }

    if (config.type === DynamicCompType.时间) {
      let type = 'time' as any
      if (config.isRange) type += 'range'
      return (
        <TimePicker
          disabled={!this.actuallyEditable}
          v-model={data[config.name]}
          type={type}
          range-separator={rangeSeparator}
        />
      )
    }

    if (config.type === DynamicCompType.数字输入框) {
      return (
        <InputNumber
          v-model={data[config.name]}
          disabled={!this.actuallyEditable}
          controls-position='right' />
      )
    }

    return <Input
      v-model={data[config.name]}
      disabled={!this.actuallyEditable}
    ></Input>
  }

  setSelectOption (opt: { query?}) {
    let { query } = opt
    let { config, data } = this
    let rs = (config.options as any)(query)
    this.loading = true
    let value
    rs.then(v => {
      value = v
    }).finally(() => {
      this.remoteSelectOptions = value || []
      this.loading = false
    })
  }
}

export const DynamicComp = convClass<DynamicCompProp>(DynamicCompModel)
