import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { LocationListener } from 'history';
import { WithStyles, Checkbox } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';


import { observer } from 'mobx-react';
import * as qs from 'query-string';

import lang from '../../lang';
import { myEnum } from '../../config/enum';
import { withRouterDeco, withStylesDeco } from '../../helpers/util';
import * as util from '../../helpers/util';
import {
    MyList, ListModel,
    MyButton, MyButtonModel,
    MyTextField,
    MySelect,
    SelectedObject,
} from '../../components';
import { msgNotice } from '../../helpers/common';
import { testApi } from '../../api';
import { TagModel, TagType } from '../components';
import { RoleQueryModel, RoleDetailModel } from './model';

const styles = () => ({
    operateCol: {
        textAlign: 'center' as any
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
export default class Role extends React.Component<Props> {
    private get innerProps() {
        return this.props as InnerProps;
    }
    private unlisten: any;
    private listModel: ListModel<RoleQueryModel>;
    constructor(props, context) {
        super(props, context);
        this.listModel = new ListModel({ query: new RoleQueryModel() });
        this.unlisten = this.innerProps.history.listen(this.onHistoryListen);
    }

    componentDidMount() {
        this.onHistoryListen(this.innerProps.history.location, null);
    }

    componentWillUnmount() {
        this.unlisten && this.unlisten();
    }

    private modelToObj(model?: ListModel<RoleQueryModel>) {
        let { query, page, } = model || this.listModel;
        let { selectedStatus } = query;
        let queryObj = {
            ...query.field,
            status: selectedStatus.selectedItems.map(ele => ele.value.value).join(','),
            page: page.pageIndex,
            rows: page.pageSize,
        };
        return queryObj;
    }

    private objToModel(obj: any, model?: ListModel<RoleQueryModel>) {
        if (!model)
            model = this.listModel;
        let { selectedStatus } = model.query;
        model.query.setValue({
            name: obj.name || '',
            code: obj.code || '',
            anyKey: obj.anyKey || '',
        });
        selectedStatus.setSelectedAll(false);
        if (obj.status) {
            (obj.status as string).split(',').map(ele => {
                let idx = selectedStatus.getItems().findIndex(item => item.value.value == ele);
                if (idx >= 0)
                    selectedStatus.setSelected(true, idx);
            });
        }
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
        let detailModel = new RoleDetailModel();
        if (detail)
            detailModel.init(detail);
        let notice = msgNotice(
            <RoleDetail
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
            </RoleDetail>, {
                type: 'dialog',
                dialogTitle: detail ? lang.Global.operate.edit : lang.Global.operate.add,
                dialogBtnList: [],
                dialogFullScreenIfSmall: true,
            });
    }

    private onDelClick = async (_id: string | string[]) => {
        let idList = _id instanceof Array ? _id : [_id];
        let obj = msgNotice(util.stringFormat(lang.Global.operate.delConfirm, idList.length), { type: 'dialog', dialogType: 'confirm' });
        let type = await obj.waitClose();
        if (type == 'accept') {
            let loading = msgNotice(lang.Global.operate.deleting, { type: 'dialog', dialogType: 'loading' });
            try {
                await testApi.roleDel(idList);
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

    onStatusUpdateClick = async (ele) => {
        let loading = msgNotice(lang.Global.operate.updating, { type: 'dialog', dialogType: 'loading' });
        try {
            await testApi.roleUpdate({
                _id: ele._id,
                status: ele.status == myEnum.roleStatus.启用 ? myEnum.roleStatus.禁用 : myEnum.roleStatus.启用
            });
            loading.close();
            this.refresh();
        } catch (e) {
            loading.close();
            msgNotice(lang.Global.operate.updateFail + `${e.message}`, { type: 'dialog' });
        }
    }

    public render() {
        const { listModel } = this;
        const { selectedStatus } = listModel.query;
        const { classes } = this.innerProps;
        let selectedRow = this.listModel.selectedRow;
        return (
            <div>
                <MyList
                    queryArgs={[{
                        id: 'name',
                        label: lang.Role.name,
                    }, {
                        id: 'code',
                        label: lang.Role.code,
                    }, {
                        id: 'anyKey',
                        label: lang.Role.anyKey,
                    }]}
                    customQueryNode={
                        <Grid item>
                            {selectedStatus.getItems().map((item, idx) => {
                                return (
                                    <FormControlLabel
                                        key={idx}
                                        control={
                                            <Checkbox checked={!!(item && item.selected)} />
                                        }
                                        label={item.value.key}
                                        onChange={(event, checked) => {
                                            selectedStatus.setSelected(checked, idx);
                                        }}
                                    />
                                );
                            })}
                        </Grid>
                    }
                    listModel={listModel}
                    onQueryClick={(model: ListModel<RoleQueryModel>) => {
                        let queryObj = this.modelToObj();
                        this.innerProps.history.replace({ pathname: this.innerProps.location.pathname, search: qs.stringify(queryObj) });
                    }}
                    onQuery={async () => {
                        let data = await testApi.roleQuery(this.modelToObj());
                        selectedRow.setItems(data.rows);
                        return data;
                    }}
                    showCheckBox={true}
                    defaultHeader={[{
                        colName: 'name',
                        content: lang.Role.name,
                    }, {
                        colName: 'code',
                        content: lang.Role.code,
                    }, {
                        colName: 'status',
                        content: lang.Role.status,
                    }, {
                        colName: 'authorityList',
                        content: lang.Role.authority,
                    }, {
                        colName: 'operate',
                        content: lang.Global.list.operate,
                        operate: true,
                    }]}
                    onDefaultRowRender={(ele, idx) => {
                        return {
                            ...ele,
                            authorityList: ele.authorityList.map((auth, authIdx) => {
                                return TagModel.render({
                                    label: auth.name,
                                    id: auth.code,
                                    disabled: auth.status !== myEnum.authorityStatus.启用
                                }, authIdx);
                            }),
                            status: myEnum.roleStatus.getKey(ele.status),
                            operate:
                                <div>
                                    <Button onClick={() => {
                                        this.onStatusUpdateClick(ele);
                                    }}>
                                        {ele.status == myEnum.roleStatus.启用 ? lang.Global.operate.disable : lang.Global.operate.enable}
                                    </Button>
                                    <Button onClick={() => {
                                        this.showDetail(ele);
                                    }}>{lang.Global.operate.edit}</Button>
                                    <Button onClick={() => {
                                        this.onDelClick(ele._id);
                                    }}>{lang.Global.operate.del}</Button>
                                </div>
                        };
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

type RoleDetailOnSaveSuccess = () => void;
type DetailProps = {
    detail?: RoleDetailModel;
    onSaveSuccess?: RoleDetailOnSaveSuccess;
};

@observer
class RoleDetail extends React.Component<DetailProps>{
    private model: RoleDetailModel;
    btnModel: MyButtonModel;
    private onSaveSuccess: RoleDetailOnSaveSuccess = () => {
        msgNotice(lang.Global.operate.saveSuccess, { type: 'dialog' });
    };
    constructor(props: DetailProps) {
        super(props);
        this.model = props.detail || new RoleDetailModel();
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
            let { addTagList, delTagList } = model.authorityTagModel.getChangeTag('id');
            let obj: any = {
                _id: field._id,
                name: field.name,
                status: field.status,
                code: field.code,
                addAuthList: addTagList,
                delAuthList: delTagList,
            };
            await testApi.roleSave(obj);
            btnModel.loaded();
            await this.onSaveSuccess();
        } catch (e) {
            btnModel.loaded();
            msgNotice(lang.Global.operate.saveFail + `${e.message}`, { type: 'dialog' });
        }
    }

    onEnterPressSave = (e) => {
        if (e.charCode == 13) {
            this.onSave();
        }
    }
    render() {
        let { model, btnModel } = this;
        let { field, authorityTagModel: tagModel } = model;
        return (
            <Grid container spacing={16}>
                <Grid item container justify="flex-start">
                    <FormControlLabel labelPlacement="start" label={lang.Role.status}
                        control={
                            <Switch color="primary" checked={field.status == myEnum.roleStatus.启用}
                                onChange={(event, checked) => {
                                    field.status = checked ? myEnum.roleStatus.启用 : myEnum.roleStatus.禁用;
                                }}
                            />
                        }
                    />
                </Grid>
                <Grid item container xs={6} onKeyPress={this.onEnterPressSave}>
                    <MyTextField autoFocus required fullWidth
                        fieldKey='name'
                        model={model}
                        label={lang.Role.name}
                    />
                </Grid>
                <Grid item container xs={6} onKeyPress={this.onEnterPressSave}>
                    <MyTextField required fullWidth
                        fieldKey='code'
                        model={model}
                        label={lang.Role.code}
                        onBlur={async () => {
                            let code = model.field.code;
                            let rs: any;
                            if (code) {
                                rs = await testApi.roleCodeExists({ code, _id: field._id });
                            }
                            model.codeExistsErr = rs ? lang.Role.codeExists : '';
                            model.valid('code');
                        }}
                    />
                </Grid>
                <Grid item container >
                    {tagModel.tagList.map((ele, idx) => {
                        return tagModel.render(ele, idx, 'default');
                    })
                    }
                    <MyTextField
                        fullWidth
                        fieldKey='authority'
                        model={model}
                        label={lang.Role.authority}
                        myAutoComplete={{
                            isAsync: true,
                            asyncGetOptions: async (val) => {
                                let rs = await testApi.authorityQuery({ anyKey: val, status: myEnum.authorityStatus.启用 });
                                return rs.rows.map(ele => { return { label: `${ele.name}(${ele.code})`, value: ele } });
                            },
                            onChange: (e) => {
                                tagModel.addTag(null, { label: e.value.name, id: e.value.code });
                                field.authority = '';
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