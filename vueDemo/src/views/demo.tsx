import { Component, Vue, Watch } from 'vue-property-decorator';

import { Input, Card } from '@/components/iview';
import { MyList } from '@/components/my-list';


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
                <MyList columns={[{ title: 'test', key: 'test' }]} data={this.list}></MyList>
                <MyList data={this.list} type="custom" customRenderFn={(rs) => {
                    if (!rs.success || !rs.total) {
                        return <Card style={{ marginTop: '10px' }}>{rs.msg}</Card>;
                    } else {
                        return rs.data.map(ele => {
                            return <Card style={{ marginTop: '10px' }}>{ele.test}</Card>;
                        });
                    }
                }}></MyList>
            </div>
        );
    }
}
