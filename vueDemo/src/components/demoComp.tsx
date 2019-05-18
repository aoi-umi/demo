import { Component, Vue, Prop } from 'vue-property-decorator';
import { ComponentOptions } from 'vue';

@Component
export default class App extends Vue {    
    @Prop({ required: false })
    public msg?: string;

    protected render() {
        return <span>{this.msg}</span>;
    }

}
