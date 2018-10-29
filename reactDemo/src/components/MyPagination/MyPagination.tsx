import * as React from "react";
import TablePagination from "@material-ui/core/TablePagination";
import { observer, inject } from 'mobx-react';
import { PaginationModel } from "./model";
type PaginationProps = {
    page?: PaginationModel
}
type InnerProps = PaginationProps & {

};
@observer
export default class MyPagination extends React.Component<PaginationProps> {
    private get innerProps() {
        return this.props as InnerProps;
    }
    private pageModel: PaginationModel;
    constructor(props) {
        super(props);
        this.pageModel = this.props.page || new PaginationModel();
    }

    render() {
        const pageModel = this.pageModel;
        return (
            <TablePagination count={pageModel.total} page={pageModel.pageIndex} rowsPerPage={pageModel.pageSize} onChangePage={(event, page) => {
                pageModel.setPage(page);
            }} onChangeRowsPerPage={(event) => {
                pageModel.setPageSize(event.target.value);
            }}></TablePagination>
        )
    }
}