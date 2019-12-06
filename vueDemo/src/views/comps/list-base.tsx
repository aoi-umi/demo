import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { Base } from '../base';
import { getCompOpts } from '@/components/utils';

export interface IListBase {
    queryOpt?: any;
    notQueryOnMounted?: boolean;
    notQueryOnRoute?: boolean;
    notQueryToRoute?: boolean;
    query: () => any;
}

export class ListBaseProp {
    @Prop()
    queryOpt?: any;

    @Prop()
    notQueryOnMounted?: boolean;

    @Prop()
    notQueryOnRoute?: boolean;

    @Prop()
    notQueryToRoute?: boolean;
}
@Component({
    extends: Base,
    mixins: [getCompOpts(ListBaseProp)]
})
export class ListBase extends Vue<ListBaseProp & Base> implements IListBase {
    mounted() {
        if (!this.notQueryOnMounted)
            this.query();
    }

    @Watch('$route')
    route(to, from) {
        if (!this.notQueryOnRoute)
            this.query();
    }

    query() {
        throw new Error('please override query');
    }
}