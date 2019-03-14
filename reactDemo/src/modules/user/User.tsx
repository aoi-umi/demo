import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';


import * as util from '../../helpers/util';
import { withRouterDeco } from '../../helpers/util';
import { msgNotice } from '../../helpers/common';

import {
    MyButton, MyButtonModel,
    MyForm,
} from '../../components';
import { cacheKey } from '../main/components/App';
import { routeConfig } from '../main/constants/route';
import { User } from '../main/model';
import { testApi } from '../api';
import { SignInModel, SignUpModel } from './model';

type DetailProps = {
    user?: User;
    onSignInSuccess?: () => void;
}
export class SignIn extends React.Component<DetailProps>{
    model: SignInModel;
    btnModel: MyButtonModel;
    constructor(props, context) {
        super(props, context);
        this.model = new SignInModel();
        this.btnModel = new MyButtonModel();
    }

    signIn = async () => {
        let { user, onSignInSuccess } = this.props;
        let { btnModel } = this;
        let { account, password } = this.model.field;
        let isVaild = this.model.validAll();
        if (!isVaild)
            return;
        try {
            btnModel.load();
            let req = { account, rand: util.randStr() };
            let token = req.account + util.md5(password) + JSON.stringify(req);
            token = util.md5(token);
            localStorage.setItem(cacheKey.testUser, token);
            let t = await testApi.userSignIn(req);
            user && user.init(t);
            onSignInSuccess && onSignInSuccess();
        } catch (e) {
            msgNotice(e.message);
        } finally {
            btnModel.loaded();
        }
    }

    render() {
        let { model, btnModel } = this;
        let field = model.field;
        return (
            <Grid container spacing={16}>
                <Grid item container
                    onKeyPress={(e) => {
                        if (e.charCode == 13) {
                            this.signIn();
                        }
                    }}>
                    <MyForm fieldKey='account' model={model} renderChild={(key) => {
                        return (
                            <TextField
                                autoFocus
                                required
                                label="账号"
                                value={field[key]}
                                onChange={(event) => { model.changeValue(key, event.target.value); }}
                            />
                        );
                    }} />

                    <MyForm fieldKey='password' model={model} renderChild={(key) => {
                        return (
                            <TextField
                                required
                                label="密码"
                                value={field[key]}
                                type='password'
                                onChange={(event) => { model.changeValue(key, event.target.value); }}
                            />
                        );
                    }} />
                </Grid>
                <Grid item container xs={12}>
                    <MyButton model={btnModel}
                        btnProps={
                            {
                                fullWidth: true,
                                onClick: this.signIn,
                                children: '登录'
                            }
                        }
                    >
                    </MyButton>
                </Grid>
            </Grid >
        );
    }
}


type SignUpInnerProps = RouteComponentProps<{}>;
@withRouterDeco
export class SignUp extends React.Component {
    private get innerProps() {
        return this.props as SignUpInnerProps;
    }
    model: SignUpModel;

    constructor(props, context) {
        super(props, context);
        this.model = new SignUpModel();
    }

    signUp = async () => {
        const { history } = this.innerProps;
        let { account, password, nickname, confirmPassword } = this.model.field;
        try {
            if (!this.model.validAll())
                return;
            await testApi.userSignUp({ account, password, nickname });
            msgNotice('注册成功', { snackbarVariant: 'success' }).waitClose().then(() => {
                history.push({ pathname: routeConfig.index });
            });
        } catch (e) {
            msgNotice(e.message);
        }
    }

    render() {
        const { model } = this;
        let field = model.field;
        return (
            <Grid container
                direction="row"
                justify="center"
                alignItems="center">
                <Grid item container spacing={16} sm={12} md={4}>
                    <Grid item container
                        onKeyPress={(e) => {
                            if (e.charCode == 13) {
                                this.signUp();
                            }
                        }}>

                        <MyForm fieldKey='account' model={model} renderChild={(key) => {
                            return (
                                <TextField
                                    autoFocus
                                    required
                                    label="账号"
                                    value={field[key]}
                                    onChange={(event) => { model.changeValue(key, event.target.value); }}
                                />
                            );
                        }
                        } />
                        <MyForm fieldKey='nickname' model={model} renderChild={(key) => {
                            return (
                                <TextField
                                    required
                                    label="昵称"
                                    fullWidth
                                    value={field[key]}
                                    onChange={(event) => { model.changeValue(key, event.target.value); }}
                                />
                            );
                        }
                        } />
                        <MyForm fieldKey='password' model={model} renderChild={(key) => {
                            return (
                                <TextField
                                    required
                                    label="密码"
                                    fullWidth
                                    value={field[key]}
                                    type='password'
                                    onChange={(event) => { model.changeValue(key, event.target.value); }}
                                />
                            );
                        }
                        } />
                        <MyForm fieldKey='confirmPassword' model={model} renderChild={(key) => {
                            return (
                                <TextField
                                    required
                                    label="确认密码"
                                    fullWidth
                                    value={field[key]}
                                    type='password'
                                    onChange={(event) => { model.changeValue(key, event.target.value); }}
                                />
                            );
                        }
                        } />
                    </Grid>
                    <Grid item container>
                        <Button fullWidth={true} onClick={this.signUp}>
                            注册
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}