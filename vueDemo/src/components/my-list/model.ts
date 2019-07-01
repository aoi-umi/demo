
export class MyTableModel<T = any> {
    page = {
        index: 1,
        size: 10
    };
    sort = {
        orderBy: '',
        sortOrder: ''
    };
    query: T = {} as any;
    setPage(p: { index?: any; size?: any }) {
        if (p) {
            let index = parseInt(p.index);
            if (!isNaN(index) && index > 0)
                this.page.index = index;

            let size = parseInt(p.size);
            if (!isNaN(size) && size > 0)
                this.page.size = size;
        }
    }

    setSort(sort: {
        orderBy,
        sortOrder
    }) {
        this.sort.orderBy = sort.orderBy;
        this.sort.sortOrder = sort.sortOrder;
    }
}