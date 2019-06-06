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
                }}>
                    {ele.isDel ?
                        <del>
                            {ele.tag}
                        </del> :
                        ele.tag
                    }
                </Tag>
            )
        });
    }

    renderAuthorityTag(list) {
        let newList = list ? list.map(ele => {
            let color = ''
            let tag = ele.code;
            if (ele.isDel || ele.status !== myEnum.authorityStatus.启用) {
                color = 'default';
            } else {
                tag = `${ele.name}(${ele.code})`;
            }
            return {
                tag,
                color,
                isDel: ele.isDel,
            };
        }) : [];
        return this.renderTag(newList);
    }

    renderRoleTag(list) {
        if (!list)
            list = [];
        return list.map(ele => {
            let color = ''
            let tag = ele.code;
            if (ele.isDel || ele.status !== myEnum.roleStatus.启用) {
                color = 'default';
            } else {
                tag = `${ele.name}(${ele.code})`;
            }
            return (
                <Tooltip theme="light" max-width="250" disabled={!ele.authorityList || !ele.authorityList.length}>
                    <div slot="content" >
                        {this.renderAuthorityTag(ele.authorityList)}
                    </div>
                    {
                        this.renderTag({
                            tag,
                            color,
                            isDel: ele.isDel,
                        })
                    }
                </Tooltip>
            )
        });
    }
}