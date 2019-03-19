import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { LocationListener } from 'history';
import { WithStyles } from '@material-ui/core';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';
import Checkbox from '@material-ui/core/Checkbox';

import AddIcon from '@material-ui/icons/Add';

import { observer } from 'mobx-react';
import { TextAlignProperty } from 'csstype';
import * as qs from 'query-string';

import lang from '../../lang';
import { withRouterDeco, withStylesDeco } from '../../helpers/util';
import { MyList, ListModel, MyButton, MyButtonModel, MyTextField } from '../../components';
import { msgNotice } from '../../helpers/common';
import { testApi } from '../api';
import { BookmarkQueryModel, BookmarkDetailModel, BookmarkShowTag } from './model';

const styles = () => ({
    operateCol: {
        textAlign: 'center' as TextAlignProperty
    },
});
type InnerProps = RouteComponentProps<{}> & WithStyles<typeof styles> & {};

@withRouterDeco
@withStylesDeco(styles)
export default class Bookmark extends React.Component {
    private get innerProps() {
        return this.props as InnerProps;
    }
    private listModel: ListModel<BookmarkQueryModel>;
    state = {
        selectedRow: []
    };
    constructor(props, context) {
        super(props, context);
        this.listModel = new ListModel({ query: new BookmarkQueryModel() });
        this.innerProps.history.listen(this.onHistoryListen);
    }

    componentDidMount() {
        this.onHistoryListen(this.innerProps.history.location, null);
    }

    private modelToObj(model?: ListModel<BookmarkQueryModel>) {
        let { query, page } = model || this.listModel;
        let queryObj = {
            ...query.field,
            page: page.pageIndex,
            rows: page.pageSize,
        };
        return queryObj;
    }

    private objToModel(obj: any, model?: ListModel<BookmarkQueryModel>) {
        if (!model)
            model = this.listModel;
        model.query.setValue({
            name: obj.name || '',
            url: obj.url || '',
            anyKey: obj.anyKey || '',
        });
        model.page.setPage(obj.page);
        model.page.setPageSize(obj.rows);
    }

    private onHistoryListen: LocationListener = (location) => {
        let obj = qs.parse(location.search);
        this.objToModel(obj);
        this.listModel.load();
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
                    let type = await msgNotice(lang.Global.operate.saveSuccess, {
                        type: 'dialog', dialogBtnList: [{
                            text: lang.Global.dialog.continue,
                        }, {
                            text: lang.Global.dialog.close,
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
                dialogTitle: detail ? lang.Global.operate.edit : lang.Global.operate.edit,
                dialogBtnList: []
            });

    }

    private onDelClick = async (_id: string) => {
        let obj = msgNotice(lang.Global.operate.delConfirm, { type: 'dialog', dialogType: 'confirm' });
        let type = await obj.waitClose();
        if (type == 'accept') {
            let loading = msgNotice(lang.Global.operate.deleting, { type: 'dialog', dialogType: 'loading' });
            try {
                await testApi.bookmarkDel(_id);
                loading.close();
                let closeType = await msgNotice(lang.Global.operate.delSuccess, {
                    type: 'dialog', dialogBtnList: [{
                        text: lang.Global.dialog.refresh, type: 'refresh'
                    }, {
                        text: lang.Global.dialog.close
                    }]
                }).waitClose();
                if (closeType == 'refresh') {
                    this.refresh();
                }
            } catch (e) {
                loading.close();
                msgNotice(lang.Global.operate.delFail + `${e.message}`, { type: 'dialog' });
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
                        id: 'name',
                        label: lang.Bookmark.name,
                    }, {
                        id: 'url',
                        label: lang.Bookmark.url,
                    }, {
                        id: 'anyKey',
                        label: lang.Bookmark.anyKey,
                    }]}
                    listModel={listModel}
                    onQueryClick={(model: ListModel<BookmarkQueryModel>) => {
                        let queryObj = this.modelToObj();
                        this.innerProps.history.replace({ pathname: this.innerProps.location.pathname, search: qs.stringify(queryObj) });
                    }}
                    onQuery={async () => {
                        let data = await testApi.bookmarkQuery(this.modelToObj());
                        return data;
                    }}
                    header={
                        <TableRow>
                            {/* <TableCell padding="checkbox"><Checkbox /></TableCell> */}
                            <TableCell>{lang.Bookmark.name}</TableCell>
                            <TableCell>{lang.Bookmark.url}</TableCell>
                            <TableCell className={classes.operateCol}>{lang.Bookmark.list.operate}</TableCell>
                        </TableRow>
                    }
                    onRowRender={(ele, idx) => {
                        let noBorder = { borderWidth: 0 };
                        return ([
                            <TableRow key={idx}>
                                {/* <TableCell rowSpan={2} padding="checkbox"><Checkbox onChange={(event, checked) => {
                                    let list = this.state.selectedRow;
                                    list[idx] = checked;
                                    //this.setState({ selectedRow: list });
                                }} />
                                </TableCell> */}
                                <TableCell style={{ ...noBorder }}>
                                    <a href={ele.url} title={ele.url} target='_blank'>
                                        {ele.name}
                                    </a>
                                </TableCell>
                                <TableCell style={{ ...noBorder }}>
                                    {ele.url}
                                </TableCell>
                                <TableCell className={classes.operateCol} style={{ ...noBorder }}>
                                    <Button onClick={() => {
                                        this.showDetail(ele);
                                    }}>{lang.Global.operate.edit}</Button>
                                    <Button onClick={() => {
                                        this.onDelClick(ele._id);
                                    }}>{lang.Global.operate.del}</Button>
                                </TableCell>
                            </TableRow>,
                            <TableRow key={idx + 'tag'}>
                                <TableCell colSpan={20}>
                                    {ele.tagList && ele.tagList.map((ele, idx) => {
                                        return renderBookmarkTag(ele, idx);
                                    })}
                                </TableCell>
                            </TableRow>
                        ]);
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

function renderBookmarkTag(tag: BookmarkShowTag | string, key?: any, onOperate?) {
    let ele = tag as BookmarkShowTag;
    let noOperate = false;
    if (typeof ele === 'string') {
        noOperate = true;
        ele = {
            tag: ele,
            status: 0,
            origStatus: 0
        };
    }
    let del = ele.status == -1;
    let add = ele.status == 1;
    let color, deleteIcon;
    if (!noOperate) {
        if (del) {
            color = 'secondary';
            deleteIcon = <AddIcon />;
        } else if (add) {
            color = 'primary';
        }
    }
    return (
        <Chip key={key}
            label={ele.tag}
            onDelete={onOperate}
            deleteIcon={deleteIcon}
            color={color}
            style={{
                marginRight: 5,
                marginBottom: 5
            }}
        />
    );
}
@observer
class BookmarkDetail extends React.Component<DetailProps>{
    private detailModel: BookmarkDetailModel;
    btnModel: MyButtonModel;
    private onSaveSuccess: BookmarkDetailOnSaveSuccess = () => {
        msgNotice(lang.Global.operate.saveSuccess, { type: 'dialog' });
    };
    constructor(props: DetailProps) {
        super(props);
        this.detailModel = props.detail || new BookmarkDetailModel();
        this.btnModel = new MyButtonModel();
        if (props.onSaveSuccess)
            this.onSaveSuccess = props.onSaveSuccess;
    }

    private onSave = async () => {
        let { detailModel, btnModel } = this;
        let isVaild = this.detailModel.validAll();
        if (!isVaild)
            return;
        try {
            btnModel.load();
            let addTagList = [], delTagList = [];
            let field = detailModel.field;
            field.showTagList.map(ele => {
                if (1 == ele.status) {
                    addTagList.push(ele.tag);
                } else if (0 == ele.origStatus && -1 == ele.status) {
                    delTagList.push(ele.tag);
                }
            })
            await testApi.bookmarkSave({
                _id: field._id,
                name: field.name,
                url: field.url,
                addTagList,
                delTagList,
            });
            btnModel.loaded();
            await this.onSaveSuccess();
        } catch (e) {
            btnModel.loaded();
            msgNotice(lang.Global.operate.saveFail + `${e.message}`, { type: 'dialog' });
        }
    }

    private onTagDelClick = (idx: number) => {
        let { detailModel } = this;
        let showTag = detailModel.field.showTagList[idx];
        detailModel.changeShowTag({
            ...showTag,
            status: -1,
        }, idx);
    }

    private onTagAddClick = (idx?: number) => {
        let { detailModel } = this;
        let field = detailModel.field;
        let showTag: BookmarkShowTag;
        if (idx !== undefined) {
            showTag = field.showTagList[idx];
        } else {
            let tag = field.tag && field.tag.trim();
            if (tag) {
                idx = field.showTagList.findIndex(ele => ele.tag == tag);
                let existsShowTag = field.showTagList[idx];
                showTag = existsShowTag || {
                    tag,
                    status: 1,
                    origStatus: 1,
                };
                detailModel.changeValue('tag', '');
            }
        }
        if (showTag) {
            detailModel.changeShowTag({
                ...showTag,
                status: showTag.origStatus
            }, idx);
        }
    }

    renderTag() {
        let { detailModel } = this;
        return detailModel.field.showTagList.map((ele, idx) => {
            return renderBookmarkTag(ele, idx, () => {
                if (ele.status == -1) {
                    this.onTagAddClick(idx);
                } else {
                    this.onTagDelClick(idx);
                }
            });
        })
    }

    render() {
        let { detailModel, btnModel } = this;
        let field = detailModel.field;
        return (
            <Grid container spacing={16}>
                <Grid item container justify='center'>
                    <MyTextField autoFocus required fullWidth
                        fieldKey='name'
                        model={detailModel}
                        label={lang.Bookmark.name}
                    />
                    <MyTextField required fullWidth
                        fieldKey='url'
                        model={detailModel}
                        label={lang.Bookmark.url}
                    />
                </Grid>
                <Grid item container>
                    {this.renderTag()}
                </Grid>
                <Grid item container>
                    <TextField
                        label={lang.Bookmark.tag}
                        style={{ width: 80 }}
                        value={field.tag}
                        onChange={(event) => { detailModel.changeValue('tag', event.target.value); }}
                    />
                    <Button onClick={() => { this.onTagAddClick(); }}>{lang.Bookmark.operate.tagAdd}</Button>
                </Grid>
                <Grid item container justify={'flex-end'}>
                    <MyButton model={btnModel} fullWidth={true} onClick={this.onSave}>
                        {lang.Global.operate.save}
                    </MyButton>
                </Grid>
            </Grid>
        );
    }
}