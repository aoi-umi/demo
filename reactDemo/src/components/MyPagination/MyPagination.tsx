import * as React from "react";
import { WithStyles, Theme } from "@material-ui/core";
import TablePagination from "@material-ui/core/TablePagination";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";

import FirstPageIcon from "@material-ui/icons/FirstPage";
import LastPageIcon from "@material-ui/icons/LastPage";
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

import { observer, inject } from 'mobx-react';
import { observable, action } from "mobx";
import { PaginationModel } from "./model";
import { withStylesDeco } from "../../helpers/util";
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
            <TablePagination
                labelDisplayedRows={() => ''}
                labelRowsPerPage={'每页大小:'}
                count={pageModel.total}
                page={pageModel.pageIndex}
                rowsPerPage={pageModel.pageSize}
                onChangePage={(event, page) => {
                    pageModel.setPage(page);
                }}
                onChangeRowsPerPage={(event) => {
                    pageModel.setPageSize(event.target.value);
                    pageModel.setPage(0);
                }}
                ActionsComponent={TablePaginationActions}
            />
        )
    }
}

const actionsStyles = (theme: Theme) => ({
    root: {
        flexShrink: 0,
        color: theme.palette.text.secondary,
    },
    totalText: {
        marginLeft: theme.spacing.unit * 2.5
    },
    pageBtn:{
        margin: 2,
        padding: 5,
        height: 25,
        width: 25,
        minWidth: 25,
    }
});

type PaginationActionsProps = {
}
type ActionsInnerProps = PaginationActionsProps & WithStyles<typeof actionsStyles, true> & {
    page: number;
    count: number;
    rowsPerPage: number;
    onChangePage?: (event, page: number) => void;
};


@withStylesDeco(actionsStyles, { withTheme: true })
@observer
class TablePaginationActions extends React.Component<PaginationActionsProps> {
    private get innerProps() {
        return this.props as ActionsInnerProps;
    }
    @observable
    private inputPage: string;
    @action
    private setInputPage(val) {
        this.inputPage = val;
    }
    handlePageButtonClick = (event, page) => {
        this.innerProps.onChangePage(event, page);
    }
    handleFirstPageButtonClick = event => {
        this.innerProps.onChangePage(event, 0);
    };

    handleBackButtonClick = event => {
        this.innerProps.onChangePage(event, this.innerProps.page - 1);
    };

    handleNextButtonClick = event => {
        this.innerProps.onChangePage(event, this.innerProps.page + 1);
    };

    handleLastPageButtonClick = event => {
        this.innerProps.onChangePage(
            event,
            Math.max(0, Math.ceil(this.innerProps.count / this.innerProps.rowsPerPage) - 1),
        );
    };

    render() {
        const { classes, count, page, rowsPerPage, theme } = this.innerProps;
        let totalPage = Math.ceil(count / rowsPerPage) - 1;
        let pageStart = 0, maxPageCount = 5;
        let pageEnd = totalPage;
        if (totalPage - page > maxPageCount) {
            pageStart = page;
            pageEnd = page + maxPageCount;
        }
        if (page > maxPageCount && pageEnd - pageStart > maxPageCount) {
            pageStart = pageEnd - maxPageCount + 1;
        }        
        return (
            <div className={classes.root}>
                <InputLabel>{page + 1}/{totalPage + 1}</InputLabel>
                <InputLabel className={classes.totalText}>共{count}条</InputLabel>

                <IconButton
                    onClick={this.handleFirstPageButtonClick}
                    disabled={page === 0}
                    aria-label="First Page"
                    className={classes.pageBtn}
                >
                    {theme.direction === 'rtl' ?
                        <LastPageIcon className={classes.pageBtn} /> :
                        <FirstPageIcon className={classes.pageBtn} />
                    }
                </IconButton>
                <IconButton
                    onClick={this.handleBackButtonClick}
                    disabled={page === 0}
                    aria-label="Previous Page"
                    className={classes.pageBtn}
                >
                    {theme.direction === 'rtl' ?
                        <KeyboardArrowRight className={classes.pageBtn} /> :
                        <KeyboardArrowLeft className={classes.pageBtn} />
                    }
                </IconButton>
                {
                    (() => {
                        let list = [];
                        for (let i = pageStart; i <= pageEnd; i++) {
                            list.push(
                                <Button
                                    key={i}
                                    className={classes.pageBtn}
                                    color={page == i ? 'primary' : 'default'}
                                    onClick={
                                        (event) => {
                                            this.handlePageButtonClick(event, i);
                                        }
                                    }

                                >{i + 1}
                                </Button>
                            );
                        }
                        return list;
                    })()
                }
                <IconButton
                    onClick={this.handleNextButtonClick}
                    disabled={page >= totalPage}
                    aria-label="Next Page"
                    className={classes.pageBtn}
                >
                    {theme.direction === 'rtl' ?
                        <KeyboardArrowLeft className={classes.pageBtn} /> :
                        <KeyboardArrowRight className={classes.pageBtn} />}
                </IconButton>
                <IconButton
                    onClick={this.handleLastPageButtonClick}
                    disabled={page >= totalPage}
                    aria-label="Last Page"
                    className={classes.pageBtn}
                >
                    {theme.direction === 'rtl' ?
                        <FirstPageIcon className={classes.pageBtn} /> :
                        <LastPageIcon className={classes.pageBtn} />}
                </IconButton>
                <TextField
                    variant="outlined"
                    InputLabelProps={{
                        shrink: false,
                    }}
                    style={{ width: 55, verticalAlign: 'middle' }}
                    onChange={(e) => {
                        this.setInputPage(e.target.value);
                    }}
                    inputProps={{
                        style: {
                            padding: '6px 14px'
                        }
                    }}
                >
                </TextField>
                <Button className={classes.pageBtn} onClick={(e) => {
                    let page = parseInt(this.inputPage);
                    this.handlePageButtonClick(e, page - 1);
                }}>
                    Go
                </Button>
            </div>
        );
    }
}