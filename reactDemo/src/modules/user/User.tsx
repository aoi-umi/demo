import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import { WithStyles, Theme } from '@material-ui/core';

import lang from '../../lang';
import * as config from '../../config/config';
import { routeConfig } from '../../config/config';
import * as util from '../../helpers/util';
import { withRouterDeco, withStylesDeco, msgNotice } from '../../helpers';
import { testApi } from '../../api';
import { main } from '../main';

import {
    MyButton, MyButtonModel,
    MyTextField,
} from '../../components';
import { DialogPage } from '../components';
import { SignInModel, SignUpModel } from './model';

type SignInProps = {
    onSignInSuccess?: () => void;
}
export class SignIn extends React.Component<SignInProps>{
    model: SignInModel;
    btnModel: MyButtonModel;
    constructor(props, context) {
        super(props, context);
        this.model = new SignInModel();
        this.btnModel = new MyButtonModel();
    }

    signIn = async () => {
        let user = main.user;
        let { onSignInSuccess } = this.props;
        let { btnModel } = this;
        let { account, password } = this.model.field;
        let isVaild = await this.model.validAll();
        if (!isVaild)
            return;
        try {
            btnModel.load();
            let req = { account, rand: util.randStr() };
            let token = req.account + util.md5(password) + JSON.stringify(req);
            token = util.md5(token);
            localStorage.setItem(config.cacheKey.testUser, token);
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
        return (
            <Grid container spacing={16}>
                <Grid item container onKeyPress={(e) => {
                    if (e.charCode == 13) {
                        this.signIn();
                    }
                }}>
                    <MyTextField fieldKey='account' model={model} autoFocus
                        required label={lang.User.account} />

                    <MyTextField fieldKey='password' model={model}
                        required label={lang.User.password}
                        type='password' />
                </Grid>
                <Grid item container xs={12}>
                    <MyButton model={btnModel} fullWidth={true} onClick={this.signIn}>
                        {lang.User.operate.signIn}
                    </MyButton>
                </Grid>
            </Grid>
        );
    }
}


const signUpStyles = (theme: Theme) => ({
    main: {
        width: 'auto',
        display: 'block' as any, // Fix IE 11 issue.
        [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
            width: 400,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    paper: {
        marginTop: theme.spacing.unit * 8,
        display: 'flex' as any,
        flexDirection: 'column' as any,
        alignItems: 'center' as any,
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
    },
    avatar: {
        margin: theme.spacing.unit,
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing.unit,
    },
});

type SignUpInnerProps = RouteComponentProps<{}> & WithStyles<typeof signUpStyles>;

@withStylesDeco(signUpStyles)
@withRouterDeco
export class SignUp extends React.Component {
    btnModel: MyButtonModel;
    private get innerProps() {
        return this.props as SignUpInnerProps;
    }
    model: SignUpModel;

    constructor(props, context) {
        super(props, context);
        this.model = new SignUpModel();
        this.btnModel = new MyButtonModel();
    }

    signUp = async () => {
        const { history } = this.innerProps;
        let { account, password, nickname } = this.model.field;
        try {
            this.btnModel.load();
            let isVaild = await this.model.validAll();
            if (!isVaild) {
                this.btnModel.loaded();
                return;
            }
            await testApi.userSignUp({ account, password, nickname });
            msgNotice(lang.User.operate.signUpSuccess, { snackbarVariant: 'success', autoHideDuration: 3000 }).waitClose().then(() => {
                history.push({ pathname: routeConfig.index.path });
            });
        } catch (e) {
            this.btnModel.loaded();
            msgNotice(e.message);
        }
    }

    render() {
        const { classes } = this.innerProps;
        const { model } = this;
        return (
            <DialogPage onSubmit={this.signUp}>
                <MyTextField fieldKey='account' model={model}
                    autoFocus required label={lang.User.account}
                    onBlur={async () => {
                        let account = model.field.account;
                        let rs: any;
                        if (account) {
                            rs = await testApi.userAccountExists(account);
                        }
                        model.accountExistsErr = rs ? lang.User.accountExists : '';
                        model.valid('account');
                    }} />
                <MyTextField fieldKey='nickname' model={model} required
                    label={lang.User.nickname} fullWidth />
                <MyTextField fieldKey='password' model={model} required
                    label={lang.User.password} fullWidth type='password' />
                <MyTextField fieldKey='confirmPassword' model={model} required
                    label={lang.User.confirmPassword} fullWidth type='password' />
                <MyButton
                    fullWidth
                    variant="contained"
                    color="primary"
                    model={this.btnModel}
                    onClick={this.signUp} type="submit">
                    {lang.User.operate.signUp}
                </MyButton>
            </DialogPage>
        );
    }
}

const accountStyles = (theme: Theme) => ({
    firstCol: {
        paddingRight: 10,
    },
});


type AccountInnerProps = WithStyles<typeof accountStyles>;
@withStylesDeco(accountStyles)
export class Account extends React.Component {
    private get innerProps() {
        return this.props as AccountInnerProps;
    }

    render() {
        let { classes } = this.innerProps;
        return (
            <Paper style={{ padding: 10 }}>
                <Grid container direction="row">
                    <Grid container item xs={2} sm={1} justify="flex-end" className={classes.firstCol}>
                        {lang.User.account}
                    </Grid>
                    <Grid item>
                        {main.user.account}
                    </Grid>
                </Grid>

                <Grid container direction="row">
                    <Grid container item xs={2} sm={1} justify="flex-end" className={classes.firstCol}>
                        {lang.User.nickname}
                    </Grid>
                    <Grid item>
                        {main.user.nickname}
                    </Grid>
                </Grid>
            </Paper>
        );
    }
}
