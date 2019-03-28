import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import classNames from 'classnames';
import { LocationListener } from 'history';
import { WithStyles, Paper } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';


import { observer } from 'mobx-react';
import { TextAlignProperty } from 'csstype';
import * as qs from 'query-string';

import lang from '../../lang';
import { myEnum } from '../../config/enum';
import { withRouterDeco, withStylesDeco } from '../../helpers/util';
import * as util from '../../helpers/util';
import {
    MyList, ListModel,
    MyButton, MyButtonModel,
    MyTextField,
} from '../../components';
import { msgNotice } from '../../helpers/common';
import { testApi } from '../../api';
import { AuthorityQueryModel, AuthorityDetailModel } from './model';

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
export default class Authority extends React.Component<Props> {
    private get innerProps() {
        return this.props as InnerProps;
    }
    private unlisten: any;
    private listModel: ListModel<AuthorityQueryModel>;
    constructor(props, context) {
        super(props, context);
        this.listModel = new ListModel({ query: new AuthorityQueryModel() });
        this.unlisten = this.innerProps.history.listen(this.onHistoryListen);
    }

    componentDidMount() {
        this.onHistoryListen(this.innerProps.history.location, null);
    }

    componentWillUnmount() {
        this.unlisten && this.unlisten();
    }

    private modelToObj(model?: ListModel<AuthorityQueryModel>) {
        let { query, page } = model || this.listModel;
        let queryObj = {
            ...query.field,
            page: page.pageIndex,
            rows: page.pageSize,
        };
        return queryObj;
    }

    private objToModel(obj: any, model?: ListModel<AuthorityQueryModel>) {
        if (!model)
            model = this.listModel;
        model.query.setValue({
            name: obj.name || '',
            code: obj.code || '',
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
        let detailModel = new AuthorityDetailModel();
        if (detail)
            detailModel.init(detail);
        let notice = msgNotice(
            <AuthorityDetail
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
            </AuthorityDetail>, {
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
                await testApi.authorityDel(idList);
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
                        label: lang.Authority.name,
                    }, {
                        id: 'code',
                        label: lang.Authority.code,
                    }, {
                        id: 'anyKey',
                        label: lang.Authority.anyKey,
                    }]}
                    listModel={listModel}
                    onQueryClick={(model: ListModel<AuthorityQueryModel>) => {
                        let queryObj = this.modelToObj();
                        this.innerProps.history.replace({ pathname: this.innerProps.location.pathname, search: qs.stringify(queryObj) });
                    }}
                    onQuery={async () => {
                        let data = await testApi.authorityQuery(this.modelToObj());
                        selectedRow.setItems(data.rows);
                        return data;
                    }}
                    showCheckBox={true}
                    defaultHeader={[{
                        colName: 'name',
                        content: lang.Authority.name,
                    }, {
                        colName: 'code',
                        content: lang.Authority.code,
                    }, {
                        colName: 'status',
                        content: lang.Authority.status,
                    }, {
                        colName: 'operate',
                        content: lang.Authority.list.operate,
                        operate: true,
                    }]}
                    ondefaultRowRender={(ele, idx) => {
                        let item = selectedRow.getItems()[idx];
                        return {
                            ...item.value,
                            status: myEnum.authorityStatus.getKey(item.value.status),
                            operate:
                                <div>
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

type AuthorityDetailOnSaveSuccess = () => void;
type DetailProps = {
    detail?: AuthorityDetailModel;
    onSaveSuccess?: AuthorityDetailOnSaveSuccess;
};

@observer
class AuthorityDetail extends React.Component<DetailProps>{
    private detailModel: AuthorityDetailModel;
    btnModel: MyButtonModel;
    private onSaveSuccess: AuthorityDetailOnSaveSuccess = () => {
        msgNotice(lang.Global.operate.saveSuccess, { type: 'dialog' });
    };
    constructor(props: DetailProps) {
        super(props);
        this.detailModel = props.detail || new AuthorityDetailModel();
        this.btnModel = new MyButtonModel();
        if (props.onSaveSuccess)
            this.onSaveSuccess = props.onSaveSuccess;
    }

    private onSave = async () => {
        let { detailModel, btnModel } = this;
        let isVaild = await this.detailModel.validAll();
        if (!isVaild)
            return;
        try {
            btnModel.load();
            let field = detailModel.field;
            await testApi.authoritySave({
                _id: field._id,
                name: field.name,
                code: field.code,
                status: field.status,
            });
            btnModel.loaded();
            await this.onSaveSuccess();
        } catch (e) {
            btnModel.loaded();
            msgNotice(lang.Global.operate.saveFail + `${e.message}`, { type: 'dialog' });
        }
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
                        label={lang.Authority.name}
                    />
                    <MyTextField required fullWidth
                        fieldKey='code'
                        model={detailModel}
                        label={lang.Authority.code}
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