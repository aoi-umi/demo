import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { myEnum } from '@/config';
import { convClass } from '@/components/utils';
import { MyTagBase } from '@/components/my-tag/my-tag';
import { Tooltip } from '@/components/iview';
import { DetailDataType } from '../system/role';
import { AuthorityTagView } from './authority-tag';


@Component
class RoleTag extends MyTagBase {
    @Prop({
        default: []
    })
    value: DetailDataType[];
    tagList: DetailDataType[] = this.value;

    @Prop()
    hideCode?: boolean;

    render() {
        return (
            <div>
                {this.tagList.map(ele => {
                    let color = '';
                    let tag = ele.code;
                    if (ele.isDel || ele.status !== myEnum.roleStatus.启用) {
                        color = 'default';
                    } else {
                        tag = `${ele.name}` + (this.hideCode ? '' : `(${ele.code})`);
                    }
                    return (
                        <Tooltip theme="light" max-width="250" disabled={!ele.authorityList || !ele.authorityList.length}>
                            <div slot="content" >
                                <AuthorityTagView value={ele.authorityList} />
                            </div>
                            {
                                this.renderTag({
                                    tag,
                                    color,
                                    isDel: ele.isDel,
                                })
                            }
                        </Tooltip>
                    );
                })}
            </div>
        );
    }
}


export const RoleTagView = convClass<RoleTag>(RoleTag);
export interface IRoleTagView extends RoleTag { };