import * as React from "react";
import { WithStyles, Theme } from "@material-ui/core";
import { WithWidth, isWidthDown } from "@material-ui/core/withWidth";
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

import { observer } from 'mobx-react';
import { observable, action } from "mobx";

import lang from '../../lang';
import * as util from "../../helpers/util";
import { withStylesDeco, withWidthDeco } from "../../helpers/util";
import { PaginationModel } from "./model";

const styles = (theme: Theme) => ({
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
        // height: 25,
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

type PaginationProps = {
    page?: PaginationModel;
    colSpan?: number;
    rowsPerPageList?: number[];
    onPageClick?: (pageModel: PaginationModel) => void;
}
type InnerProps = PaginationProps & WithStyles<typeof styles, true> & WithWidth & {

};

@withWidthDeco()
@withStylesDeco(styles, { withTheme: true })
@observer
export default class MyPagination extends React.Component<PaginationProps> {
    private get innerProps() {
        return this.props as InnerProps;
    }
    private pageModel: PaginationModel;
    private rowsPerPageList = [10, 20, 30];
    constructor(props) {
        super(props);
        this.pageModel = this.props.page || new PaginationModel();

        let rowsPerPageList = this.innerProps.rowsPerPageList;
        if (rowsPerPageList && rowsPerPageList.length)
            this.rowsPerPageList = rowsPerPageList;
    }

    @observable
    private inputPage: string;
    @action
    private setInputPage(val) {
        this.inputPage = val;
    }
    handlePageButtonClick = (event, page) => {
        this.onChangePage(event, page);
    }
    handleFirstPageButtonClick = event => {
        this.onChangePage(event, 1);
    };

    handleBackButtonClick = event => {
        this.onChangePage(event, this.pageModel.pageIndex - 1);
    };

    handleNextButtonClick = event => {
        this.onChangePage(event, this.pageModel.pageIndex + 1);
    };

    handleLastPageButtonClick = event => {
        this.onChangePage(
            event,
            Math.max(1, Math.ceil(this.pageModel.total / this.pageModel.pageSize)),
        );
    };

    onChangePage = (event, page: number) => {
        let { pageModel } = this;
        pageModel.setPage(page);
        if (this.innerProps.onPageClick)
            this.innerProps.onPageClick(pageModel);
    }

    onChangeRowsPerPage = event => {
        let { pageModel } = this;
        pageModel.setPageSize(event.target.value);
        pageModel.setPage(1);
        if (this.innerProps.onPageClick)
            this.innerProps.onPageClick(pageModel);
    }

    renderPagination() {
        const pageModel = this.pageModel;
        const { classes, theme, width, } = this.innerProps;
        let rowsPerPageList = this.rowsPerPageList;

        let {
            total: count,
            pageIndex: page,
            pageSize: rowsPerPage,
        } = pageModel;
        let isSm = isWidthDown('sm', width);
        let isXs = isWidthDown('xs', width);
        let totalPage = Math.ceil(count / rowsPerPage);
        let maxPageCount = isXs ? 3 : 5;
        if (totalPage < maxPageCount)
            maxPageCount = totalPage;
        let size = Math.floor(maxPageCount / 2);
        let pageStart = page - size, pageEnd = page + size;
        if (pageStart < 1) {
            pageStart = 1;
        }
        if (pageEnd > totalPage)
            pageEnd = totalPage;

        pageEnd = Math.min(pageStart + maxPageCount - 1, totalPage);
        pageStart = Math.max(pageEnd - maxPageCount + 1, 1);

        let newLine = <div style={{ height: 5 }}></div>;
        return (
            <div className={classes.root}>
                {
                    isSm ? null : <InputLabel className={classes.totalText}>{lang.MyPagination.rowsPerPage}</InputLabel>
                }
                <Select
                    value={rowsPerPage}
                    onChange={this.onChangeRowsPerPage}
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

                <InputLabel>{page}/{totalPage}</InputLabel>
                <InputLabel className={classes.totalText}>{util.stringFormat(lang.MyPagination.totalCount, count)}</InputLabel>
                {
                    isSm ? newLine : null
                }

                <Button
                    onClick={this.handleFirstPageButtonClick}
                    disabled={page === 1}
                    className={classes.pageBtn}
                >
                    <FirstPageIcon className={classes.pageBtn} />
                </Button>
                <Button
                    onClick={this.handleBackButtonClick}
                    disabled={page === 1}
                    className={classes.pageBtn}
                >
                    <KeyboardArrowLeft className={classes.pageBtn} />
                </Button>
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

                                >{i}
                                </Button>
                            );
                        }
                        return list;
                    })()
                }
                <Button
                    onClick={this.handleNextButtonClick}
                    disabled={page >= totalPage}
                    className={classes.pageBtn}
                >
                    <KeyboardArrowRight className={classes.pageBtn} />
                </Button>
                <Button
                    onClick={this.handleLastPageButtonClick}
                    disabled={page >= totalPage}
                    className={classes.pageBtn}
                >
                    <LastPageIcon className={classes.pageBtn} />
                </Button>
                {
                    isXs ? newLine : null
                }
                <TextField
                    variant="outlined"
                    InputLabelProps={{
                        shrink: false,
                    }}
                    style={{ width: 55, verticalAlign: 'middle', margin: '0 5px' }}
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
                <Button variant="contained" size="small" className={`${classes.pageBtn} ${classes.goBtn}`} onClick={(e) => {
                    let page = parseInt(this.inputPage);
                    this.handlePageButtonClick(e, page);
                }}>
                    {lang.MyPagination.toPage}
                </Button>
            </div>
        );
    }

    render() {
        let isSm = isWidthDown('sm', this.innerProps.width);

        return (
            <TableCell colSpan={this.innerProps.colSpan || 1000} style={{ textAlign: isSm ? 'center' : 'right' }}>
                {this.renderPagination()}
            </TableCell>
        )
    }
}