import { Vue } from 'vue-property-decorator';
import { Tag } from '@/components/iview';
import { TagType } from './model';
export class MyTag extends Vue {
    renderTag(tagList: (string | TagType)[]) {
        return tagList.map(ele => {
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