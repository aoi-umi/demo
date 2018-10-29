import * as React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TableHead from "@material-ui/core/TableHead";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import FilledInput from '@material-ui/core/FilledInput';
import TextField from '@material-ui/core/TextField';
import { observer, inject } from 'mobx-react';
import { WithStyles, TableCell } from "@material-ui/core";
import MyPagination, { PaginationModel } from '../MyPagination';
import { ListModel, QueryDataType, QueryResult, QueryModel } from "./model";
import { withStylesDeco } from "../../helpers/util";
type ListProps = {
    queryRows?: {
        id: string;
        text?: string;
        placeholder?: string;
    }[];
    header?: React.ReactNode;
    labelNoData?: React.ReactNode;
    onQueryClick: (query) => Promise<QueryDataType>;
    onRowRender: (ele, idx?: number) => any;
    queryModel: QueryModel;
}

const styles = theme => ({
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
    private listModel = new ListModel();
    private labelNoData: React.ReactNode = 'No Data';
    constructor(props) {
        super(props);
        let { labelNoData, queryModel } = this.innerProps;
        this.listModel.query = queryModel;
        if (labelNoData)
            this.labelNoData = labelNoData;
        this.onQuery();
    }

    async onQuery() {
        let result: QueryResult = {
            success: false,
        }
        try {
            result.data = await this.props.onQueryClick(this.listModel.query);
            result.success = true;
        } catch (e) {
            result.msg = e.message;
        }
        this.listModel.changeResult(result);
    }

    onReset() {
        this.listModel.query.init();
    }

    private contentRender() {
        let { listModel, labelNoData } = this;
        if (listModel.result) {
            let msg: any;
            if (!listModel.result.success)
                msg = listModel.result.msg || 'Query Fail';
            else if (listModel.result.success) {
                if (!listModel.result.data.list.length)
                    msg = labelNoData;
                else {
                    let list = [];
                    let idx = 0;
                    for (let ele of listModel.result.data.list) {
                        list.push(this.innerProps.onRowRender(ele, idx++));
                    }
                    return list;
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
                                <FormControl variant="filled" fullWidth={true}>
                                    <TextField
                                        variant="outlined"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        label={ele.text || ele.id}
                                        placeholder={ele.placeholder}
                                        value={listModel.query[ele.id] || ''}
                                        onChange={(e) => {
                                            listModel.query.changeValue(ele.id, e.target.value);
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.charCode == 13) {
                                                this.onQuery();
                                            }
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
                            }}>重置</Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" onClick={() => {
                                this.onQuery();
                            }}>查询</Button>
                        </Grid>
                    </Grid>
                </Grid>
                <Paper className={classes.tableRoot}>
                    <Table>
                        <TableHead>
                            {header}
                        </TableHead>
                        <TableBody>
                            {
                                this.contentRender()
                            }
                            <TableRow title={'loading'}>
                            </TableRow>
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <MyPagination page={page}></MyPagination>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </Paper>
            </div>
        )
    }
}