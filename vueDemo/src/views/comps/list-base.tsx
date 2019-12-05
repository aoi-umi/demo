import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { Base } from '../base';

export interface IListBase {
    queryOpt?: any;
    notQueryOnMounted?: boolean;
    notQueryOnRoute?: boolean;
    notQueryToRoute?: boolean;
    query: () => any;
}

@Component
export class ListBase extends Base implements IListBase {
    @Prop()
    queryOpt: any;

    @Prop()
    notQueryOnMounted: boolean;

    @Prop()
    notQueryOnRoute: boolean;

    @Prop()
    notQueryToRoute: boolean;

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