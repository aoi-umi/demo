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
  options?: SelectOptionType[] | ((query: string) => Promise<SelectOptionType[]> | SelectOptionType[]);
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
}

@Component({
  extends: Base,
  mixins: [getCompOpts(DynamicCompProp)]
})
class DynamicCompModel extends Vue<DynamicCompProp & Base> {
  stylePrefix = 'comp-dynamic-comp-';
  private loading = false
  render () {
    return (
      <div>
        {this.showText && this.config.text}
        <div class={this.getStyleName('container')}>{this.renderComp()}</div>
      </div>
    )
  }

  @Watch('config', {
    immediate: true
  })
  private watchConfig () {
    this.setSelectOption()
  }

  private selectOptions: SelectOptionType[] = []
  renderComp () {
    let { data, config } = this
    let rangeSeparator = config.rangeSeparator || '-'

    if (config.type === DynamicCompType.选择器) {
      return (
        <Select v-model={data[config.name]} filterable loading={this.loading} remote-method={(...args: any) => {
          this.setSelectOption(args[0])
        }}>
          {this.selectOptions?.map(ele => {
            return <i-option value={ele.value} key={ele.label}>{ele.label}</i-option>
          })}
        </Select>
      )
    }

    if (config.type === DynamicCompType.多选框) {
      return <Checkbox v-model={data[config.name]} />
    }

    if (
      [DynamicCompType.日期, DynamicCompType.日期时间].includes(config.type)
    ) {
      let type = {
        [DynamicCompType.日期]: 'date',
        [DynamicCompType.日期时间]: 'datetime'
      }[config.type] as any
      if (config.isRange) type += 'range'
      return <DatePicker type={type} v-model={data[config.name]} />
    }

    if (config.type === DynamicCompType.时间) {
      let type = 'time' as any
      if (config.isRange) type += 'range'
      return (
        <TimePicker
          v-model={data[config.name]}
          type={type}
          range-separator={rangeSeparator}
        />
      )
    }

    if (config.type === DynamicCompType.数字输入框) {
      return (
        <InputNumber v-model={data[config.name]} controls-position='right' />
      )
    }

    return <Input v-model={data[config.name]}></Input>
  }

  setSelectOption (query?) {
    let { config, data } = this
    if (typeof config.options === 'function') {
      let rs = config.options(query)
      if (rs instanceof Promise) {
        this.loading = true
        rs.then(v => {
          this.selectOptions = v || []
        }).finally(() => {
          this.loading = false
        })
      } else {
        this.selectOptions = rs || []
      }
    } else { this.selectOptions = config.options }
  }
}

export const DynamicComp = convClass<DynamicCompProp>(DynamicCompModel)
