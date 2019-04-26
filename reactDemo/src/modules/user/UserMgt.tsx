import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import classNames from 'classnames';
import { LocationListener } from 'history';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import { WithStyles, Theme } from '@material-ui/core';

import { observer } from 'mobx-react';
import * as qs from 'query-string';
import * as moment from 'moment';
import { DateTimePicker } from 'material-ui-pickers';

import lang from '../../lang';
import * as config from '../../config/config';
import { withRouterDeco, withStylesDeco, msgNotice } from '../../helpers';
import { testApi } from '../../api';
import { main } from '../main';

import {
    MyList, ListModel,
    MyButton, MyButtonModel,
    MyTextField,
} from '../../components';
import { UserMgtDetailModel } from './model';
import { myEnum } from '../../config/enum';
import { TagModel } from '../components';
import { observable } from 'mobx';

const userMgtStyles = (theme: Theme) => ({
    htmlTooltip: {
        backgroundColor: 'white',
        color: 'rgba(0, 0, 0, 0.9)',
        // maxWidth: 220,
        fontSize: theme.typography.pxToRem(12),
        paddingTop: 10,
        border: '1px solid #dadde9',
        '& b': {
            fontWeight: theme.typography.fontWeightMedium,
        },
    },
    operateCol: {
        textAlign: 'center' as any
    },
    hidden: {
        display: 'none'
    }
});
type UserMgtProps = {
    listenUrl?: string;
};
type UserMgtInnerProps = RouteComponentProps<{}> & WithStyles<typeof userMgtStyles> & UserMgtProps;
@withRouterDeco
@withStylesDeco(userMgtStyles)
@observer
export class UserMgt extends React.Component<UserMgtProps>{
    private get innerProps() {
        return this.props as UserMgtInnerProps;
    }
    private listModel: ListModel;
    private unlisten: any;
    @observable
    enableAuthToggle: any[] = [];

    @observable
    data = {
        date: null as Date
    };

    constructor(props, context) {
        super(props, context);
        this.listModel = new ListModel({ query: {} as any });
        this.unlisten = this.innerProps.history.listen(this.onHistoryListen);
    }

    componentDidMount() {
        this.onHistoryListen(this.innerProps.history.location, null);
    }

    componentWillUnmount() {
        this.unlisten && this.unlisten();
    }

    private modelToObj(model?: ListModel) {
        let { query, page } = model || this.listModel;
        let queryObj = {
            //...query.field,
            page: page.pageIndex,
            rows: page.pageSize,
        };
        return queryObj;
    }

    private objToModel(obj: any, model?: ListModel) {
        if (!model)
            model = this.listModel;

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

    showDetail = (detail) => {
        let detailModel = new UserMgtDetailModel();
        detailModel.init(detail);
        let notice = msgNotice(
            <UserMgtDetail
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
            </UserMgtDetail>, {
                type: 'dialog',
                dialogTitle: detail ? lang.Global.operate.edit : lang.Global.operate.add,
                dialogBtnList: [],
                dialogFullScreenIfSmall: true,
            });

    }
    public render() {
        const { listModel } = this;
        const { classes } = this.innerProps;
        return (
            <div>
                <MyList
                    queryArgs={[]}
                    customQueryNode={
                        <Grid item xs={12} sm={4} md={3}>
                            <DateTimePicker value={this.data.date} label='createdAtFrom' onChange={(e) => { this.data.date = e; }} clearable >
                            </DateTimePicker>
                        </Grid>
                    }
                    hideQueryBtn={{ add: true }}
                    listModel={listModel}
                    onQueryClick={(model: ListModel) => {
                        let queryObj = this.modelToObj();
                        this.innerProps.history.replace({ pathname: this.innerProps.location.pathname, search: qs.stringify(queryObj) });
                    }}
                    onQuery={async () => {
                        let data = await testApi.userMgtList(this.modelToObj());
                        this.enableAuthToggle = new Array((data && data.rows && data.rows.length) || 0);
                        return data;
                    }}
                    defaultHeader={[{
                        colName: 'account',
                        content: lang.User.account,
                    }, {
                        colName: 'nickname',
                        content: lang.User.nickname,
                    }, {
                        colName: 'roleList',
                        content: lang.UserMgt.role,
                    }, {
                        colName: 'authorityList',
                        content: lang.UserMgt.authority,
                    }, {
                        colName: 'createdAt',
                        content: lang.User.createdAt,
                    }, {
                        colName: 'operate',
                        content: lang.Global.list.operate,
                        operate: true,
                    }]}

                    onRowRender={((ele, idx) => {
                        let enableAuth = [];
                        let enableAuthRowKey = 'enableAuth' + idx;
                        for (let key in ele.auth) {
                            let auth = ele.auth[key];
                            enableAuth.push(TagModel.render({
                                label: auth.name,
                                id: auth.code,
                            }, key));
                        }
                        let existsAuth = enableAuth.length > 0;
                        let rowSpan = existsAuth ? 2 : 1;
                        let rows = [
                            <TableRow key={idx}>
                                <TableCell rowSpan={rowSpan}>
                                    {ele.account}
                                </TableCell>
                                <TableCell rowSpan={rowSpan}>
                                    {ele.nickname}
                                </TableCell>
                                <TableCell>
                                    {
                                        ele.roleList.map((role, roleIdx) => {
                                            let roleTag = TagModel.render({
                                                label: role.name,
                                                id: role.code,
                                                disabled: role.status !== myEnum.roleStatus.启用
                                            }, roleIdx);
                                            return role.authorityList.length ?
                                                <Tooltip
                                                    classes={{
                                                        // popper: classes.htmlPopper,
                                                        tooltip: classes.htmlTooltip,
                                                    }}
                                                    title={
                                                        <React.Fragment>
                                                            {role.authorityList.map((auth, authIdx) => {
                                                                return TagModel.render({
                                                                    label: auth.name,
                                                                    id: auth.code,
                                                                    disabled: auth.status !== myEnum.authorityStatus.启用
                                                                }, authIdx)
                                                            })}
                                                        </React.Fragment>
                                                    }
                                                    key={roleIdx} placement="bottom">
                                                    {roleTag}
                                                </Tooltip>
                                                : roleTag;
                                        })
                                    }
                                </TableCell>
                                <TableCell>
                                    {
                                        ele.authorityList.map((auth, authIdx) => {
                                            return TagModel.render({
                                                label: auth.name,
                                                id: auth.code,
                                                disabled: auth.status !== myEnum.authorityStatus.启用
                                            }, authIdx);
                                        })
                                    }
                                </TableCell>
                                <TableCell rowSpan={rowSpan}>
                                    {moment(ele.createdAt).format(config.dateFormat)}
                                </TableCell>
                                <TableCell rowSpan={rowSpan} className={classes.operateCol}>
                                    <div>
                                        <Button onClick={() => {
                                            this.showDetail(ele);
                                        }}>{lang.Global.operate.edit}</Button>
                                    </div>
                                </TableCell>
                            </TableRow>,
                        ];
                        if (existsAuth) {
                            rows.push(
                                <TableRow key={enableAuthRowKey}>
                                    <TableCell colSpan={2}>
                                        <Button onClick={() => {
                                            this.enableAuthToggle[idx] = !this.enableAuthToggle[idx];
                                        }}>{lang.UserMgt.enableAuthority}</Button>
                                        <div className={classNames(!this.enableAuthToggle[idx] && classes.hidden)} style={{ margin: 5 }}>
                                            {enableAuth}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        }
                        return rows;
                    })}
                >
                </MyList>
            </div >
        )
    }
}

const userMgtDetailStyles = (theme: Theme) => ({
    firstCol: {
        paddingRight: 10,
    },
});
type UserMgtDetailOnSaveSuccess = () => void;
type DetailProps = {
    detail: UserMgtDetailModel;
    onSaveSuccess?: UserMgtDetailOnSaveSuccess;
};
type DetailInnerProps = DetailProps & WithStyles<typeof userMgtDetailStyles>;

@withStylesDeco(userMgtDetailStyles)
@observer
class UserMgtDetail extends React.Component<DetailProps>{
    private get innerProps() {
        return this.props as DetailInnerProps;
    }
    private model: UserMgtDetailModel;
    btnModel: MyButtonModel;
    private onSaveSuccess: UserMgtDetailOnSaveSuccess = () => {
        msgNotice(lang.Global.operate.saveSuccess, { type: 'dialog' });
    };
    constructor(props: DetailProps) {
        super(props);
        this.model = props.detail || new UserMgtDetailModel();
        this.btnModel = new MyButtonModel();
        if (props.onSaveSuccess)
            this.onSaveSuccess = props.onSaveSuccess;
    }

    private onSave = async () => {
        let { model, btnModel } = this;
        let isVaild = await model.validAll();
        if (!isVaild)
            return;
        try {
            btnModel.load();
            let field = model.field;
            let auth = model.authorityTagModel.getChangeTag('id');
            let role = model.roleTagModel.getChangeTag('id');
            let obj: any = {
                _id: field._id,
                addAuthList: auth.addTagList,
                delAuthList: auth.addTagList,
                addRoleList: role.addTagList,
                delRoleList: role.addTagList,
            };
            await testApi.userMgtSave(obj);
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
        let { classes } = this.innerProps;
        let { field, authorityTagModel, roleTagModel } = model;
        return (
            <Grid container spacing={16}>
                <Grid container item direction="row">
                    <Grid container item xs={2} sm={1} justify="flex-end" className={classes.firstCol}>
                        {lang.User.nickname}
                    </Grid>
                    <Grid item>
                        {main.user.nickname}
                    </Grid>
                </Grid>
                <Grid item container >
                    {roleTagModel.tagList.map((ele, idx) => {
                        return roleTagModel.render(ele, idx, 'default');
                    })}
                    <MyTextField
                        fullWidth
                        fieldKey='role'
                        model={model}
                        label={lang.UserMgt.role}
                        myAutoComplete={{
                            isAsync: true,
                            asyncGetOptions: async (val) => {
                                let rs = await testApi.roleQuery({ anyKey: val, status: myEnum.roleStatus.启用 });
                                return rs.rows.map(ele => { return { label: `${ele.name}(${ele.code})`, value: ele } });
                            },
                            onChange: (e) => {
                                roleTagModel.addTag(null, { label: e.value.name, id: e.value.code });
                                field.role = '';
                            }
                        }}
                    />
                </Grid>
                <Grid item container >
                    {authorityTagModel.tagList.map((ele, idx) => {
                        return authorityTagModel.render(ele, idx, 'default');
                    })}
                    <MyTextField
                        fullWidth
                        fieldKey='authority'
                        model={model}
                        label={lang.UserMgt.authority}
                        myAutoComplete={{
                            isAsync: true,
                            asyncGetOptions: async (val) => {
                                let rs = await testApi.authorityQuery({ anyKey: val, status: myEnum.authorityStatus.启用 });
                                return rs.rows.map(ele => { return { label: `${ele.name}(${ele.code})`, value: ele } });
                            },
                            onChange: (e) => {
                                authorityTagModel.addTag(null, { label: e.value.name, id: e.value.code });
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