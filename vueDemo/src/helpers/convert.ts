import { MyTableModel } from '@/components/my-list';

export class Test {
    //query参数与列表model之间的转换
    static queryToListModel(query: any, model: MyTableModel) {
        model.setPage({ index: query.page, size: query.rows });
        let sort = { 1: 'asc', '-1': 'desc' };
        model.setSort({ orderBy: query.orderBy, sortOrder: sort[query.sortOrder as any] });
    }

    static listModelToQuery(model: MyTableModel) {
        return {
            page: model.page.index,
            rows: model.page.size,
            orderBy: model.sort.orderBy,
            sortOrder: model.sort.sortOrder,
        };
    }
}