import * as React from "react";
import classNames from 'classnames';

import { WithStyles, Theme, } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Checkbox from '@material-ui/core/Checkbox';

import { observer } from 'mobx-react';

import lang from '../../lang';
import { withStylesDeco } from "../../helpers/util";

import MyPagination from '../MyPagination';
import MyTextField from '../MyTextField';
import MyButton, { MyButtonModel } from "../MyButton";
import { ListModel, QueryDataType, QueryResult } from "./model";
import { BottomAppBar } from "../../modules/components";
type ListProps = {
    queryArgs?: {
        id: string;
        label?: string;
        placeholder?: string;
    }[];
    header?: React.ReactNode;
    onRowRender?: (ele, idx?: number) => any;

    defaultHeader?: { colName: string, content: any, operate?: boolean }[];
    onDefaultRowRender?: (ele, idx?: number) => any;

    labelNoData?: React.ReactNode;
    showCheckBox?: boolean;
    onQueryClick: (query) => any;
    onQuery: () => Promise<QueryDataType>;
    listModel: ListModel;
    onAddClick?: () => any;
    onBottomDelClick?: () => any;
    bottomBtnList?: React.ReactNode[];
    hideQueryBtn?: {
        all?: boolean;
        add?: boolean;
        reset?: boolean;
        query?: boolean;
    };
    hideBottomBtn?: {
        all?: boolean;
        del?: boolean;
    }
}

const styles = (theme: Theme) => ({
    tableRoot: {
        marginTop: theme.spacing.unit * 3,
    },
    operateCol: {
        textAlign: 'center' as any
    }
});
type InnerProps = ListProps & WithStyles<typeof styles> & {

};

@withStylesDeco(styles)
@observer
export default class MyList extends React.Component<ListProps> {
    private get innerProps() {
        return this.props as InnerProps;
    }
    private listModel: ListModel;
    private queryBtnModel: MyButtonModel;
    private labelNoData: React.ReactNode = lang.MyList.noData;
    constructor(props) {
        super(props);
        let { labelNoData, listModel, header, defaultHeader, onRowRender } = this.innerProps;
        this.listModel = listModel;
        if (labelNoData)
            this.labelNoData = labelNoData;
        this.listModel.onLoad = this.onQuery.bind(this);
        this.listModel.onLoaded = (result: QueryResult) => {
            this.listModel.changeResult(result);
        }
        this.queryBtnModel = new MyButtonModel();
        if ((!header || !onRowRender) && !(defaultHeader))
            throw new Error('props error');
    }

    async onQuery(page?: number) {
        let result: QueryResult = {
            success: false,
        }
        if (page !== undefined)
            this.listModel.page.setPage(page);
        try {
            this.queryBtnModel.load();
            result.data = await this.props.onQuery();
            result.success = true;
        } catch (e) {
            result.msg = e.message;
        } finally {
            this.queryBtnModel.loaded();
        }
        this.listModel.onLoaded(result);
    }

    onAddClick = () => {
        this.innerProps.onAddClick && this.innerProps.onAddClick();
    }

    onDelClick = () => {
        this.innerProps.onBottomDelClick && this.innerProps.onBottomDelClick();
    }

    onReset() {
        this.listModel.query.init();
    }

    private contentRender() {
        let { listModel, labelNoData, } = this;
        let { showCheckBox, defaultHeader, classes } = this.innerProps;
        let { selectedRow } = listModel;
        if (listModel.loading) {
            return (
                <TableRow title={'loading'}>
                    <TableCell colSpan={100} style={{ textAlign: 'center' }}>
                        <CircularProgress />
                    </TableCell>
                </TableRow>
            );
        }
        else {
            let msg: any = lang.MyList.noQuery;
            if (listModel.result) {
                if (!listModel.result.success)
                    msg = listModel.result.msg || lang.MyList.queryFail;
                else if (listModel.result.success) {
                    let rows = listModel.result.data.rows;
                    if (!rows.length)
                        msg = labelNoData;
                    else {
                        let list = [];
                        for (let idx = 0; idx < rows.length; idx++) {
                            let ele = rows[idx];
                            if (this.innerProps.onRowRender)
                                list.push(this.innerProps.onRowRender(ele, idx));
                            else {
                                let obj = this.innerProps.onDefaultRowRender ?
                                    this.innerProps.onDefaultRowRender(ele, idx) : ele;
                                let item = selectedRow.getItems()[idx];
                                list.push(
                                    <TableRow key={idx}>
                                        {showCheckBox &&
                                            <TableCell padding="checkbox">
                                                <Checkbox checked={!!(item && item.selected)} onChange={(event, checked) => {
                                                    selectedRow.setSelected(checked, idx);
                                                }} />
                                            </TableCell>
                                        }
                                        {
                                            defaultHeader.map((header, colIdx) => {
                                                return (
                                                    <TableCell key={colIdx} className={classNames(header.operate && classes.operateCol)}>{obj && obj[header.colName] || ''}</TableCell>
                                                );
                                            })
                                        }
                                    </TableRow>
                                );
                            }
                        }
                        return list;
                    }
                }
            }
            return (
                <TableRow>
                    <TableCell colSpan={100} style={{ textAlign: 'center' }}>{msg}</TableCell>
                </TableRow>
            );
        }
    }
    render() {
        const { queryArgs, header, defaultHeader, classes, hideQueryBtn, showCheckBox, hideBottomBtn } = this.innerProps;
        const { listModel } = this;
        const { page, selectedRow } = listModel;
        return (
            <div>
                <Grid container spacing={16}>
                    <Grid container item spacing={16} onKeyPress={(e) => {
                        if (e.charCode == 13) {
                            this.listModel.page.setPage(1);
                            this.innerProps.onQueryClick(this.listModel);
                        }
                    }}>
                        {queryArgs && queryArgs.map((ele, idx) => {
                            return (
                                <Grid item key={idx} xs={12} sm={4} md={3}>
                                    <MyTextField
                                        fieldKey={ele.id}
                                        model={listModel.query}
                                        label={ele.label || ele.id}
                                        placeholder={ele.placeholder}>
                                    </MyTextField>
                                </Grid>
                            );
                        })}
                    </Grid>
                    <Grid container item
                        direction="row"
                        justify="flex-end"
                        alignItems="center"
                        spacing={16}
                    >
                        {
                            (!hideQueryBtn || (!hideQueryBtn.all && !hideQueryBtn.reset)) &&
                            <Grid item>
                                <Button variant="contained" onClick={() => {
                                    this.onReset();
                                }}>{lang.MyList.reset}</Button>
                            </Grid>
                        }
                        {
                            (!hideQueryBtn || (!hideQueryBtn.all && !hideQueryBtn.query)) &&
                            <Grid item>
                                <MyButton variant="contained" model={this.queryBtnModel} onClick={() => {
                                    this.listModel.page.setPage(1);
                                    this.innerProps.onQueryClick(this.listModel);
                                }}>{lang.MyList.query}</MyButton>
                            </Grid>
                        }
                        {
                            (!hideQueryBtn || (!hideQueryBtn.all && !hideQueryBtn.add)) &&
                            <Grid item>
                                <Button variant="contained" onClick={this.onAddClick}>{lang.Global.operate.add}</Button>
                            </Grid>
                        }
                    </Grid>
                </Grid>
                <Paper className={classes.tableRoot}>
                    <div style={{ overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                {header || (defaultHeader &&
                                    <TableRow>
                                        {showCheckBox && (
                                            <TableCell padding="checkbox">
                                                <Checkbox checked={selectedRow.selectedAll} onChange={(event, checked) => {
                                                    selectedRow.setSelectedAll(checked);
                                                }} />
                                            </TableCell>
                                        )}
                                        {defaultHeader.map((ele, idx) => {
                                            return (
                                                <TableCell key={idx} className={classNames(ele.operate && classes.operateCol)}>{ele.content}</TableCell>
                                            );
                                        })}
                                    </TableRow>
                                )}
                            </TableHead>
                            <TableBody>
                                {
                                    this.contentRender()
                                }
                            </TableBody>
                        </Table>
                    </div>
                    <Table>
                        <TableFooter>
                            <TableRow>
                                <MyPagination
                                    page={page}
                                    onPageClick={() => {
                                        this.innerProps.onQueryClick(this.listModel);
                                    }}></MyPagination>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </Paper>

                <BottomAppBar in={selectedRow.selected}>
                    {
                        (!hideBottomBtn || (!hideBottomBtn.all && !hideBottomBtn.del)) &&
                        <MyButton onClick={this.onDelClick}>
                            {lang.Global.operate.delMulti}
                        </MyButton>
                    }
                    {this.innerProps.bottomBtnList}
                </BottomAppBar>
            </div >
        )
    }
}

