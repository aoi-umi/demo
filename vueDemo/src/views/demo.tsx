import { Component, Vue, Watch } from 'vue-property-decorator';

import { Input } from '../components/iview';


import DemoComp from '../components/demoComp';
@Component
export default class App extends Vue {
    public value = '';
    public msg = '';
    public list: { test: string }[] = [];
    public get valueLength() {
        return this.value.length;
    }

    public created() {
        console.log('created.');
        this.setList();
    }

    public handleClick() {
        console.log('click');
        this.setList();
    }

    setList() {
        this.list = [{
            test: '1'
        }, {
            test: '2'
        }, {
            test: '3'
        }, {
            test: '4'
        }, {
            test: '5'
        }];
    }

    @Watch('value')
    protected valueWatch(newV: any, oldV: any) {
        this.msg = `new value：${newV}`;
    }

    protected render() {
        return (
            <div>
                <input type='text' v-model={this.value} />
                <Input value={this.value}></Input>
                {this.msg}
                <button class='class2' onClick={this.handleClick}>
                    点我
                </button>
                <div>
                    <DemoComp msg='u see see u' />
                </div>
                {this.list.map(ele => {
                    return <Input v-model={ele.test}></Input>
                })}
                <div>
                    {JSON.stringify(this.list)}
                </div>
            </div>
        );
    }
}
