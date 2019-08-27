import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { convClass } from '@/helpers';
import { myEnum } from '@/config';
import { MyTagBase } from '@/components/my-tag/my-tag';


@Component
class AuthorityTag extends MyTagBase {
    @Prop()
    hideCode?: boolean;

    created() {
        super.created();
    }

    protected convertValue(ele) {
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
        return super.render();
    }
}


export const AuthorityTagView = convClass<AuthorityTag>(AuthorityTag);
export interface IAuthorityTagView extends AuthorityTag { };