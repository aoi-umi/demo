import * as React from "react";
import { WithStyles, Theme } from "@material-ui/core";
import { WithWidth, isWidthDown } from "@material-ui/core/withWidth";
import TablePagination from "@material-ui/core/TablePagination";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import TextField from "@material-ui/core/TextField";
import TableCell from "@material-ui/core/TableCell";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

import FirstPageIcon from "@material-ui/icons/FirstPage";
import LastPageIcon from "@material-ui/icons/LastPage";
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

import { observer, inject } from 'mobx-react';
import { observable, action } from "mobx";
import { PaginationModel } from "./model";
import { withStylesDeco, withWidthDeco } from "../../helpers/util";
type PaginationProps = {
    page?: PaginationModel,
    colSpan?: number,
}
type InnerProps = PaginationProps & WithWidth & {

};

@withWidthDeco()
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
        let isSm = isWidthDown('sm', this.innerProps.width);

        return (
            <TableCell colSpan={this.innerProps.colSpan || 1000} style={{ textAlign: isSm ? 'center' : 'right' }}>
                <TablePaginationActions
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
                ></TablePaginationActions>
            </TableCell>
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
    pageBtn: {
        margin: 2,
        padding: 5,
        height: 25,
        width: 25,
        minWidth: 25,
    },
    goBtn: {
        width: 60,
    },
    selectEmpty: {
        marginRight: theme.spacing.unit * 2,
        paddingLeft: theme.spacing.unit,
        paddingRight: theme.spacing.unit,
    },
});

type PaginationActionsProps = {
    page: number;
    count: number;
    rowsPerPage: number;
    rowsPerPageList?: number[];
    onChangePage: (event, page: number) => void;
    onChangeRowsPerPage: (event) => void;
}
type ActionsInnerProps = PaginationActionsProps & WithStyles<typeof actionsStyles, true> & WithWidth & {

};


@withWidthDeco()
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
        const { classes, count, page, rowsPerPage, theme, width } = this.innerProps;
        let rowsPerPageList = this.innerProps.rowsPerPageList;
        if (!rowsPerPageList || !rowsPerPageList.length)
            rowsPerPageList = [10, 20, 30];
        let isSm = isWidthDown('sm', width);
        let isXs = isWidthDown('xs', width);
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
        let newLine = <div style={{ height: 5 }}></div>;
        return (
            <div className={classes.root}>
                {isSm ? null :
                    <InputLabel className={classes.totalText}>每页大小:</InputLabel>
                }
                <Select
                    value={this.innerProps.rowsPerPage}
                    onChange={this.innerProps.onChangeRowsPerPage}
                    displayEmpty
                    className={classes.selectEmpty}
                >
                    {rowsPerPageList.map((ele, idx) => {
                        return (
                            <MenuItem key={idx} value={ele}>
                                {ele}
                            </MenuItem>
                        );
                    })}
                </Select>

                <InputLabel>{page + 1}/{totalPage + 1}</InputLabel>
                <InputLabel className={classes.totalText}>共{count}条</InputLabel>
                {
                    isSm ?
                        newLine : null
                }

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
                {
                    isXs ?
                        newLine : null
                }
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
                <Button className={`${classes.pageBtn} ${classes.goBtn}`} onClick={(e) => {
                    let page = parseInt(this.inputPage);
                    this.handlePageButtonClick(e, page - 1);
                }}>
                    Go
                </Button>
            </div>
        );
    }
}