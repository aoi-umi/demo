import { Vue, Prop, Watch, Component } from 'vue-property-decorator';
import { Tag, Tooltip } from '@/components/iview';
import { convClass } from '@/helpers';
import { TagType } from './model';
export type RenderTagType = string | TagType;

@Component
export class MyTagBase extends Vue {
    @Prop()
    value: RenderTagType | (RenderTagType[]);

    protected convertValue(ele: any): RenderTagType {
        return ele;
    }

    @Watch('value')
    protected watchValue(newValue) {
        let newList = [];
        if (newValue)
            newList = newValue instanceof Array ? newValue : [newValue];
        if (this.convertValue)
            newList = newList.map(ele => this.convertValue(ele));
        this.tagList = newList;
    }

    tagList: RenderTagType[] = [];

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
                    let checkable = (ele as Object).hasOwnProperty('checkable') ? ele.checkable : false;
                    return (
                        <Tag color={ele.color as any || "blue"} checkable={checkable} checked={ele.selected} on-on-change={(checked) => {
                            ele.selected = checked;
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