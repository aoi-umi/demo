import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { convClass } from '@/helpers';
import { myEnum } from '@/config';
import { MyTagBase } from '@/components/my-tag/my-tag';

export type AuthorityDetail = {
    isDel?: boolean;
    code?: string;
    status: number;
    name: string;
}
@Component
class AuthorityTag extends MyTagBase<AuthorityDetail> {

    @Prop()
    hideCode?: boolean

    private convert(ele: AuthorityDetail) {
        let color = '';
        let tag = ele.code;
        if (ele.isDel || ele.status !== myEnum.authorityStatus.启用) {
            color = 'default';
        } else {
            tag = `${ele.name}` + (this.hideCode ? '' : `(${ele.code})`);
        }
        return {
            tag,
            color,
            isDel: ele.isDel,
        };
    }

    render() {
        return this.renderTag(this.tagList.map(ele => this.convert(ele)));
    }
}


export const AuthorityTagView = convClass<AuthorityTag>(AuthorityTag);
export interface IAuthorityTagView extends AuthorityTag { };