import { Component, Vue, Watch } from 'vue-property-decorator';
import { MyTable } from '@/components/my-table';
import { testApi } from '@/api';

@Component
export default class Bookmark extends Vue {
    protected render() {
        return (
            <div>
                <MyTable
                    queryArgs={[{
                        key: 'name',
                        label: '名字',
                    }, {
                        key: 'url',
                    }]}
                    columns={[{
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
                                <div>
                                    <a>编辑</a>
                                    <a>删除</a>
                                </div>
                            );
                        }
                    }]}
                    data={[{ name: 1, url: 222 }]}

                    queryFn={async (model) => {
                        let rs = await testApi.bookmarkQuery({
                            name: model.query.name,
                            url: model.query.url,
                            page: model.page.index,
                            rows: model.page.size
                        });
                        return rs;
                    }}
                ></MyTable>
            </div>
        );
    }
}