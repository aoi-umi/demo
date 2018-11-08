import * as React from 'react';
import { WithStyles } from '@material-ui/core';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { observer } from 'mobx-react';
import { TextAlignProperty } from 'csstype';

import { withRouterDeco, withStylesDeco } from '../../helpers/util';
import { MyList } from '../../components';
import { BookmarkQueryModel, BookmarkDetailModel } from './model';
import { testApi } from '../api';
import { ListModel } from '../../components/MyList';
import { msgNotice } from '../../helpers/common';

const styles = () => ({
    operateCol: {
        textAlign: 'center' as TextAlignProperty
    },
});
type InnerProps = WithStyles<typeof styles> & {};

@withRouterDeco
@withStylesDeco(styles)
export default class Bookmark extends React.Component {
    private input: React.RefObject<HTMLInputElement>;
    private get innerProps() {
        return this.props as InnerProps;
    }
    private listModel: ListModel<BookmarkQueryModel>;
    constructor(props, context) {
        super(props, context);
        this.input = React.createRef();
        this.listModel = new ListModel(new BookmarkQueryModel());
    }

    private refresh = () => {
        this.listModel.page.setPage(this.listModel.page.pageIndex);
    }

    private showDetail = (detail?) => {
        let detailModel = new BookmarkDetailModel();
        if (detail)
            detailModel.init(detail);
        let notice = msgNotice(
            <BookmarkDetail
                detail={detailModel}
                onSaveSuccess={async () => {
                    let type = await msgNotice(`保存成功`, {
                        type: 'dialog', dialogBtnList: [{
                            text: '继续',
                        }, {
                            text: '关闭',
                            type: 'close',
                        }]
                    }).waitClose();
                    if (type == 'close') {
                        notice.close();
                        this.refresh();
                    }
                }}
            >
            </BookmarkDetail>, {
                type: 'dialog',
                dialogTitle: detail ? '修改' : '新增',
                dialogBtnList: []
            });

    }

    private onDelClick = async (_id: string) => {
        let obj = msgNotice('确认删除?', { type: 'dialog', dialogType: 'confirm' });
        let type = await obj.waitClose();
        if (type == 'accept') {
            let loading = msgNotice('删除中', { type: 'dialog', dialogType: 'loading' });
            try {
                await testApi.bookmarkDel(_id);
                loading.close();
                let closeType = await msgNotice('删除成功', {
                    type: 'dialog', dialogBtnList: [{
                        text: '刷新', type: 'refresh'
                    }, {
                        text: '关闭'
                    }]
                }).waitClose();
                if (closeType == 'refresh') {
                    this.refresh();
                }
            } catch (e) {
                loading.close();
                msgNotice(`删除失败:${e.message}`, { type: 'dialog' });
            }
        }
    }

    public render() {
        const { listModel } = this;
        const { classes } = this.innerProps;
        return (
            <div>
                <MyList
                    queryRows={[{
                        id: 'name'
                    }, {
                        id: 'url'
                    }, {
                        id: 'anyKey'
                    }]}
                    listModel={listModel}
                    onQueryClick={async (model: ListModel<BookmarkQueryModel>) => {
                        let query = model.query;
                        let page = model.page;
                        let data = await testApi.bookmarkQuery({
                            name: query.name,
                            url: query.url,
                            anyKey: query.anyKey,
                            page: page.pageIndex + 1,
                            rows: page.pageSize,
                        });
                        return data;
                    }}
                    header={
                        <TableRow>
                            <TableCell>名字</TableCell>
                            <TableCell>url</TableCell>
                            <TableCell className={classes.operateCol}>操作</TableCell>
                        </TableRow>
                    }
                    onRowRender={(ele, idx) => {
                        return (
                            <TableRow key={idx}>
                                <TableCell>
                                    <a href={ele.url} title={ele.url} target={'_blank'}>
                                        {ele.name}
                                    </a>
                                </TableCell>
                                <TableCell>
                                    {ele.url}
                                </TableCell>
                                <TableCell className={classes.operateCol}>
                                    <Button onClick={() => {
                                        this.showDetail(ele);
                                    }}>修改</Button>
                                    <Button onClick={() => {
                                        this.onDelClick(ele._id);
                                    }}>删除</Button>
                                </TableCell>
                            </TableRow>
                        );
                    }}

                    onAddClick={() => {
                        this.showDetail();
                    }}
                >
                </MyList>
            </div>
        )
    }
}

type BookmarkDetailOnSaveSuccess = () => void;
type DetailProps = {
    detail?: BookmarkDetailModel;
    onSaveSuccess?: BookmarkDetailOnSaveSuccess;
}

@observer
class BookmarkDetail extends React.Component<DetailProps>{
    private detailModel: BookmarkDetailModel;
    private onSaveSuccess: BookmarkDetailOnSaveSuccess = () => {
        msgNotice(`保存成功`, { type: 'dialog' });
    };
    constructor(props: DetailProps) {
        super(props);
        this.detailModel = props.detail || new BookmarkDetailModel();
        if (props.onSaveSuccess)
            this.onSaveSuccess = props.onSaveSuccess;
    }

    private onSave = async () => {
        let loading = msgNotice('保存中', { type: 'dialog', dialogType: 'loading' });
        try {
            await testApi.bookmarkSave(this.detailModel);
            loading.close();
            await this.onSaveSuccess();
        } catch (e) {
            loading.close();
            msgNotice(`保存失败:${e.message}`, { type: 'dialog' });
        }
    }

    render() {
        let { detailModel } = this;
        return (
            <Grid container spacing={16}>
                <Grid item container>
                    <TextField
                        autoFocus
                        required
                        label="Name"
                        fullWidth
                        value={detailModel.name}
                        onChange={(event) => { detailModel.changeValue('name', event.target.value); }}
                    />
                    <TextField
                        required
                        label="Url"
                        fullWidth
                        value={detailModel.url}
                        onChange={(event) => { detailModel.changeValue('url', event.target.value); }}
                    />
                </Grid>
                <Grid item container justify={'flex-end'}>
                    <Button onClick={this.onSave}>保存</Button>
                </Grid>
            </Grid>
        );
    }
}