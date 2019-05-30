import { Vue } from 'vue-property-decorator';
import { Tag } from '@/components/iview';
import { TagType } from './model';
export type RenderTagType = string | TagType;
export class MyTag extends Vue {
    renderTag(tagList: RenderTagType | (RenderTagType[])) {
        let list = tagList instanceof Array ? tagList : [tagList];
        return list.map(ele => {
            if (typeof ele === 'string') {
                return <Tag color="blue">{ele}</Tag>
            }
            let checkable = (ele as Object).hasOwnProperty('checkable') ? ele.checkable : false;
            return (
                <Tag color={ele.color as any || "blue"} checkable={checkable} checked={ele.selected} on-on-change={(checked) => {
                    ele.selected = checked;
                }}> {ele.tag} </Tag>
            )
        });
    }
}