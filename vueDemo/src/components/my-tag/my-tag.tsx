import { Vue } from 'vue-property-decorator';
import { Tag, Tooltip } from '@/components/iview';
import { TagType } from './model';
import { myEnum } from '@/config';
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

    renderAuthorityTag(list) {
        let newList = list ? list.map(ele => {
            return {
                tag: `${ele.name}(${ele.code})`,
                color: ele.status == myEnum.authorityStatus.启用 ? '' : 'default'
            }
        }) : [];
        return this.renderTag(newList);
    }

    renderRoleTag(list) {
        if (!list)
            list = [];
        return list.map(ele => {
            return (
                <Tooltip theme="light" max-width="250" disabled={!ele.authorityList || !ele.authorityList.length}>
                    <div slot="content" >
                        {this.renderAuthorityTag(ele.authorityList)}
                    </div>
                    {
                        this.renderTag({
                            tag: `${ele.name}(${ele.code})`,
                            color: ele.status == myEnum.roleStatus.启用 ? '' : 'default'
                        })
                    }
                </Tooltip>
            )
        });
    }
}