import { Component, Vue, Watch } from 'vue-property-decorator';
import { MyTable } from '@/components/my-table';
import { testApi } from '@/api';

@Component
export default class Bookmark extends Vue {
    protected render() {
        return (
            <div>
                <MyTable
                    queryArgs={[...new Array(10).keys()].map(ele => {
                        return {
                            id: 'name',
                            label: '名字',
                        }
                    })}
                    columns={
                        [{
                            title: '名字',
                            key: 'name'
                        }, {
                            title: 'url',
                            key: 'url',
                            render: (h, params) => {
                                return (<a href={params.row.url}>{params.row.url}</a>);
                            }
                        }, {
                            title: '操作',
                            key: 'action',
                            fixed: 'right',
                            width: 120,
                            render: (h, params) => {
                                return (
                                    <div>测试{params.row.name}</div>
                                );
                            }
                        }]
                    }
                    data={[{ name: 1, url: 222 }]}

                    onQuery={async (model) => {
                        console.log(model);
                        let rs = await testApi.bookmarkQuery();
                        return rs;
                    }}
                ></MyTable>
            </div>
        );
    }
}