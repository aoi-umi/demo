import { Vue, Prop, Watch, Component } from 'vue-property-decorator';
import { convClass } from '../utils';
import { Tag, Tooltip } from '../iview';
import { TagType } from './model';
export type RenderTagType = string | TagType;

@Component
export class MyTagBase<T = RenderTagType> extends Vue {
    @Prop()
    value: T | (T[]);

    @Watch('value')
    protected watchValue(newValue) {
        let newList = [];
        if (newValue)
            newList = newValue instanceof Array ? newValue : [newValue];
        newList.map(ele => {
            if (typeof ele !== 'string') {
                if (!('checked' in ele))
                    this.$set(ele, 'checked', false);
                if (!('checkable' in ele))
                    this.$set(ele, 'checkable', false);
            }
        });
        this.tagList = newList;
    }

    tagList: T[] = [];

    created() {
        this.watchValue(this.value);
    }

    render() {
        return this.renderTag(this.tagList);
    }

    renderTag(tagList: RenderTagType | (RenderTagType[])) {
        let list = tagList instanceof Array ? tagList : [tagList];
        return (
            <div>
                {list.map(ele => {
                    if (typeof ele === 'string') {
                        return <Tag color="blue">{ele}</Tag>;
                    }
                    return (
                        <Tag color={ele.color as any || "blue"} checkable={ele.checkable} checked={ele.checked} on-on-change={(checked) => {
                            ele.checked = checked;
                        }}>
                            {ele.isDel ?
                                <del>
                                    {ele.tag}
                                </del> :
                                ele.tag
                            }
                        </Tag>
                    );
                })}
            </div>
        );
    }
}

const MyTagView = convClass<MyTagBase>(MyTagBase);
export default MyTagView;
export interface IMyTag extends MyTagBase { };