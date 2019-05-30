import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { convClass } from '@/helpers';
import { Option, Select, Input } from '../iview';

@Component
class MyInput extends Vue {
    @Prop()
    value?: string;

    @Prop()
    label?: string;

    @Prop({
        default: () => []
    })
    data: any[];

    @Prop()
    disabled?: boolean;

    @Prop()
    clearable?: boolean;

    @Prop()
    placeholder?: string;

    @Prop()
    size?: '' | 'small' | 'large' | 'default';

    @Prop()
    icon?: string;

    @Prop()
    placement?: 'bottom' | 'top' | 'top-start' | 'bottom-start' | 'top-end' | 'bottom-end';

    @Prop()
    transfer?: boolean;

    @Prop()
    name?: string;

    @Prop()
    elementId?: string;

    @Prop()
    loading?: boolean;

    private get innerRefs() {
        return this.$refs as { select: any, input: any }
    }
    private currentValue = this.value;
    private disableEmitChange = false;

    get inputIcon() {
        let icon = '';
        if (this.clearable && this.currentValue) {
            icon = 'ios-close';
        } else if (this.icon) {
            icon = this.icon;
        }
        return icon;
    }
    get filteredData() {
        // if (this.filterMethod) {
        //     return this.data.filter(item => this.filterMethod(this.currentValue, item));
        // } else {
        return this.data;
        // }
    }

    @Watch('value')
    watchValue(val) {
        if (this.currentValue !== val) {
            this.disableEmitChange = true;
        }
        this.currentValue = val;
    }

    @Watch('currentValue')
    watchCurrentValue(val) {
        this.innerRefs.select.setQuery(val);
        this.$emit('input', val);
        if (this.disableEmitChange) {
            this.disableEmitChange = false;
            return;
        }
        this.$emit('on-change', val);
        // this.dispatch('FormItem', 'on-form-change', val);
    }
    private firstFocus = true;
    private handleInputChange(e) {
        let val = e.target.value && e.target.value.trim();
        this.$emit('on-search', val);
    }
    private handleChange(val) {
        if (val === undefined || val === null) return;
        // this.currentValue = val;
        this.$refs.input['blur']();
        this.$emit('on-select', val);
    }
    private handleFocus(event) {
        if (this.firstFocus) {
            this.firstFocus = false;
            this.$emit('on-search', '');
        }
        this.$emit('on-focus', event);
    }
    private handleBlur(event) {
        this.$emit('on-blur', event);
    }
    private handleClear() {
        if (!this.clearable) return;
        if (this.currentValue !== '')
            this.$emit('on-search', '');
        this.currentValue = '';
        this.innerRefs.select['reset']();
        this.$emit('on-clear');
    }
    protected render() {
        return (
            <Select
                ref="select"
                class="ivu-auto-complete"
                label={this.label}
                disabled={this.disabled}
                clearable={this.clearable}
                // placeholder={this.placeholder}
                size={this.size}
                placement={this.placement}
                // value={this.currentValue}
                // filterable
                // remote
                auto-complete
                // remote-method={this.remoteMethod}
                on-on-change={this.handleChange}
                transfer={this.transfer}
                loading={this.loading}>
                {this.$slots.input
                    || <Input
                        element-id={this.elementId}
                        ref="input"
                        slot="input"
                        v-model={this.currentValue}
                        name={this.name}
                        placeholder={this.placeholder}
                        disabled={this.disabled}
                        size={this.size}
                        icon={this.inputIcon}
                        on-on-click={this.handleClear}
                        on-on-focus={this.handleFocus}
                        on-on-change={this.handleInputChange}
                        on-on-blur={this.handleBlur} />
                }
                {this.$slots.default ||
                    this.filteredData.map(item => {
                        //@ts-ignore
                        return <Option value={item} key={item}>{item}</Option>
                    })
                }
            </Select >
        );
    }
}

const MyInputView = convClass<MyInput>(MyInput);
export default MyInputView;