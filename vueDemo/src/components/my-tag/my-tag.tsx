import { Vue } from 'vue-property-decorator';
import { Tag } from '@/components/iview';
import { TagType } from './model';
class MyTag extends Vue {
    renderTag(tagList: (string | TagType)[]) {
        return tagList.map(ele => {
            if (typeof ele === 'string') {
                return <Tag color="blue">{ele}</Tag>
            }
            return (
                <Tag color="blue" checkable checked={ele.selected} on-on-change={(checked) => {
                    ele.selected = checked;
                }}> {ele.tag} </Tag>
            )
        });
    }
}

export const myTag = new MyTag();