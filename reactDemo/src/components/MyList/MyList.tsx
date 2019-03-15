import * as React from "react";

import { WithStyles, Theme } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';

import { observer } from 'mobx-react';

import lang from '../../lang';
import MyPagination from '../MyPagination';
import { Model } from "../Base";
import { ListModel, QueryDataType, QueryResult } from "./model";
import { withStylesDeco } from "../../helpers/util";
type ListProps = {
    queryRows?: {
        id: string;
        label?: string;
        placeholder?: string;
    }[];
    header?: React.ReactNode;
    labelNoData?: React.ReactNode;
    onQueryClick: (query) => any;
    onQuery: () => Promise<QueryDataType>;
    onRowRender: (ele, idx?: number) => any;
    listModel: ListModel;
    onAddClick?: () => any;
}

const styles = (theme: Theme) => ({
    tableRoot: {
        marginTop: theme.spacing.unit * 3,
    },
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
    private labelNoData: React.ReactNode = lang.MyList.noData;
    constructor(props) {
        super(props);
        let { labelNoData, listModel } = this.innerProps;
        this.listModel = listModel;
        if (labelNoData)
            this.labelNoData = labelNoData;
        this.listModel.page.onPageChange =
            this.listModel.onLoad = this.onQuery.bind(this);
        this.listModel.onLoaded = (result: QueryResult) => {
            this.listModel.changeResult(result);
        }
    }

    async onQuery(page?: number) {
        let result: QueryResult = {
            success: false,
        }
        if (page !== undefined)
            this.listModel.page.setPage(page);
        try {
            result.data = await this.props.onQuery();
            result.success = true;
        } catch (e) {
            result.msg = e.message;
        }
        this.listModel.onLoaded(result);
    }

    onAddClick = () => {
        this.innerProps.onAddClick && this.innerProps.onAddClick();
    }

    onReset() {
        this.listModel.query.init();
    }

    private contentRender() {
        let { listModel, labelNoData } = this;
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
                    if (!listModel.result.data.rows.length)
                        msg = labelNoData;
                    else {
                        let list = [];
                        let idx = 0;
                        for (let ele of listModel.result.data.rows) {
                            list.push(this.innerProps.onRowRender(ele, idx++));
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
        const { queryRows, header, classes } = this.innerProps;
        const { listModel } = this;
        const { page } = listModel;
        return (
            <div>
                <Grid container spacing={16}>
                    <Grid container item spacing={16}>
                        {queryRows && queryRows.map((ele, idx) => {
                            return (<Grid item key={idx} xs={12} sm={4} md={3}>
                                <FormControl fullWidth={true}
                                    onKeyPress={(e) => {
                                        if (e.charCode == 13) {
                                            this.listModel.page.setPage(1);
                                            this.innerProps.onQueryClick(this.listModel);
                                        }
                                    }}>
                                    <TextField
                                        variant="outlined"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        label={ele.label || ele.id}
                                        placeholder={ele.placeholder}
                                        value={listModel.query[ele.id] || ''}
                                        onChange={(e) => {
                                            listModel.query.changeValue(ele.id, e.target.value);
                                        }}
                                    >
                                    </TextField>
                                </FormControl>
                            </Grid>);
                        })}
                    </Grid>
                    <Grid container item
                        direction="row"
                        justify="flex-end"
                        alignItems="center"
                        spacing={16}
                    >
                        <Grid item>
                            <Button variant="contained" onClick={() => {
                                this.onReset();
                            }}>{lang.MyList.reset}</Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" onClick={() => {
                                this.listModel.page.setPage(1);
                                this.innerProps.onQueryClick(this.listModel);
                            }}>{lang.MyList.query}</Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" onClick={this.onAddClick}>{lang.Global.operate.add}</Button>
                        </Grid>
                    </Grid>
                </Grid>
                <Paper className={classes.tableRoot}>
                    <div style={{ overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                {header}
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
            </div >
        )
    }
}

