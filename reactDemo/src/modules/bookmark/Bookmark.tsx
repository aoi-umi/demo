import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import classNames from 'classnames';
import { LocationListener } from 'history';
import { WithStyles, Paper } from '@material-ui/core';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';


import { observer } from 'mobx-react';
import { TextAlignProperty } from 'csstype';
import * as qs from 'query-string';

import lang from '../../lang';
import { withRouterDeco, withStylesDeco } from '../../helpers/util';
import * as util from '../../helpers/util';
import {
    MyList, ListModel,
    MyButton, MyButtonModel,
    MyTextField,
} from '../../components';
import { msgNotice } from '../../helpers/common';
import { testApi } from '../../api';
import { TagModel } from '../components';
import { BookmarkQueryModel, BookmarkDetailModel } from './model';

const styles = () => ({
    operateCol: {
        textAlign: 'center' as TextAlignProperty
    },
    noBorder: {
        borderWidth: 0
    }
});
type Props = {
    listenUrl?: string;
};
type InnerProps = RouteComponentProps<{}> & WithStyles<typeof styles> & Props;

@withRouterDeco
@withStylesDeco(styles)
@observer
export default class Bookmark extends React.Component<Props> {
    private get innerProps() {
        return this.props as InnerProps;
    }
    private listModel: ListModel<BookmarkQueryModel>;
    private unlisten: any;
    constructor(props, context) {
        super(props, context);
        this.listModel = new ListModel({ query: new BookmarkQueryModel() });
        this.unlisten = this.innerProps.history.listen(this.onHistoryListen);
    }

    componentDidMount() {
        this.onHistoryListen(this.innerProps.history.location, null);
    }

    componentWillUnmount() {
        this.unlisten && this.unlisten();
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
        if (location.pathname != this.props.listenUrl)
            return;
        let obj = qs.parse(location.search);
        this.objToModel(obj);
        this.listModel.load();
    }

    private refresh = () => {
        this.listModel.load();
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
                dialogTitle: detail ? lang.Global.operate.edit : lang.Global.operate.add,
                dialogBtnList: []
            });

    }

    private onDelClick = async (_id: string | string[]) => {
        let idList = _id instanceof Array ? _id : [_id];
        let obj = msgNotice(util.stringFormat(lang.Global.operate.delConfirm, idList.length), { type: 'dialog', dialogType: 'confirm' });
        let type = await obj.waitClose();
        if (type == 'accept') {
            let loading = msgNotice(lang.Global.operate.deleting, { type: 'dialog', dialogType: 'loading' });
            try {
                await testApi.bookmarkDel(idList);
                loading.close();
                let closeType = await msgNotice(lang.Global.operate.delSuccess, {
                    type: 'dialog',
                }).waitClose();
                this.refresh();
            } catch (e) {
                loading.close();
                msgNotice(lang.Global.operate.delFail + `${e.message}`, { type: 'dialog' });
            }
        }
    }

    public render() {
        const { listModel } = this;
        const { classes } = this.innerProps;
        let selectedRow = this.listModel.selectedRow;
        return (
            <div>
                <MyList
                    queryArgs={[{
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
                        selectedRow.setItems(data.rows);
                        return data;
                    }}
                    header={
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox checked={selectedRow.selectedAll} onChange={(event, checked) => {
                                    selectedRow.setSelectedAll(checked);
                                }} />
                            </TableCell>
                            <TableCell>{lang.Bookmark.name}</TableCell>
                            <TableCell>{lang.Bookmark.url}</TableCell>
                            <TableCell className={classes.operateCol}>{lang.Global.list.operate}</TableCell>
                        </TableRow>
                    }
                    onRowRender={(ele, idx) => {
                        let item = selectedRow.getItems()[idx];
                        let existsTag = ele.tagList && ele.tagList.length;
                        let renderRow = [
                            <TableRow key={idx}>
                                <TableCell rowSpan={existsTag ? 2 : 1} padding="checkbox">
                                    <Checkbox checked={!!(item && item.selected)} onChange={(event, checked) => {
                                        selectedRow.setSelected(checked, idx);
                                    }} />
                                </TableCell>
                                <TableCell className={classNames(existsTag && classes.noBorder)}>
                                    <a href={ele.url} title={ele.url} target='_blank'>
                                        {ele.name}
                                    </a>
                                </TableCell>
                                <TableCell className={classNames(existsTag && classes.noBorder)}>
                                    {ele.url}
                                </TableCell>
                                <TableCell className={classNames(classes.operateCol, existsTag && classes.noBorder)}>
                                    <Button onClick={() => {
                                        this.showDetail(ele);
                                    }}>{lang.Global.operate.edit}</Button>
                                    <Button onClick={() => {
                                        this.onDelClick(ele._id);
                                    }}>{lang.Global.operate.del}</Button>
                                </TableCell>
                            </TableRow>
                        ];
                        if (existsTag) {
                            renderRow.push(
                                <TableRow key={idx + 'tag'}>
                                    <TableCell colSpan={20}>
                                        {ele.tagList.map((ele, idx) => {
                                            return TagModel.render(ele, idx);
                                        })}
                                    </TableCell>
                                </TableRow>
                            );
                        }
                        return renderRow;
                    }}

                    onAddClick={() => {
                        this.showDetail();
                    }}

                    onBottomDelClick={() => {
                        let idList = selectedRow.selectedItems.map(ele => {
                            return ele.value._id;
                        });
                        this.onDelClick(idList);
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
    private model: BookmarkDetailModel;
    btnModel: MyButtonModel;
    private onSaveSuccess: BookmarkDetailOnSaveSuccess = () => {
        msgNotice(lang.Global.operate.saveSuccess, { type: 'dialog' });
    };
    constructor(props: DetailProps) {
        super(props);
        this.model = props.detail || new BookmarkDetailModel();
        this.btnModel = new MyButtonModel();
        if (props.onSaveSuccess)
            this.onSaveSuccess = props.onSaveSuccess;
    }

    private onSave = async () => {
        let { model, btnModel } = this;
        let isVaild = await this.model.validAll();
        if (!isVaild)
            return;
        try {
            btnModel.load();
            let field = model.field;
            
            let { addTagList, delTagList } = model.tagModel.getChangeTag('id');            
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

    renderTag() {
        let { model } = this;
        return model.tagModel.tagList.map((ele, idx) => {
            return model.tagModel.render(ele, idx, 'default');
        })
    }

    render() {
        let { model, btnModel } = this;
        let field = model.field;
        return (
            <Grid container spacing={16}>
                <Grid item container justify='center' onKeyPress={(e) => {
                    if (e.charCode == 13) {
                        this.onSave();
                    }
                }}>
                    <MyTextField autoFocus required fullWidth
                        fieldKey='name'
                        model={model}
                        label={lang.Bookmark.name}
                    />
                    <MyTextField required fullWidth
                        fieldKey='url'
                        model={model}
                        label={lang.Bookmark.url}
                    />
                </Grid>
                <Grid item container>
                    {this.renderTag()}
                </Grid>
                <Grid item container>
                    <MyTextField
                        fieldKey='tag'
                        model={model}
                        label={lang.Bookmark.tag}
                        variant="standard"
                        placeholder={lang.Bookmark.operate.tagPlaceholder}
                        onKeyPress={(e) => {
                            if (e.charCode == 13) {
                                model.tagModel.addTag(null, model.field.tag);
                                model.field.tag = '';
                            }
                        }}
                    />
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