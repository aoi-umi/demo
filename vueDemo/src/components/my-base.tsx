import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Utils } from './utils';

@Component
export class MyBase extends Vue {
    protected stylePrefix = 'base-';
    protected getStyleName(...args: string[]) {
        return Utils.getStyleName(this.stylePrefix, ...args);
    }
}