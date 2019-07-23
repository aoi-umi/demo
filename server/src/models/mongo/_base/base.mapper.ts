export class BaseMapper {
    static getListOptions(data) {
        return {
            page: data.page,
            rows: data.rows,
            sortOrder: data.sortOrder,
            orderBy: data.orderBy
        };
    }
}