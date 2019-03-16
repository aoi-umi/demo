import * as React from 'react';
import { ReactNode } from 'react';
import { RouteComponentProps } from 'react-router';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { WithStyles, Theme } from '@material-ui/core';


import lang from '../../lang';
import * as util from '../../helpers/util';
import { withRouterDeco, withStylesDeco, msgNotice } from '../../helpers';
import { main } from '../main';

import {
    MyButton, MyButtonModel,
    MyForm,
} from '../../components';
import { routeConfig, cacheKey } from '../main';
import { User } from '../main/model';
import { testApi } from '../api';
import { SignInModel, SignUpModel } from './model';

const dialogStyles = (theme: Theme) => ({
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
type DialogProps = {
    children: ReactNode;
}
type DialogInnerProps = DialogProps & WithStyles<typeof dialogStyles>;


@withStylesDeco(dialogStyles)
class Dialog extends React.Component<DialogProps> {
    private get innerProps() {
        return this.props as DialogInnerProps;
    }
    render() {
        const { classes } = this.innerProps;
        return (
            <main className={classes.main}>
                <Paper className={classes.paper}>
                    <form className={classes.form}>
                        {this.innerProps.children}
                    </form>
                </Paper>
            </main>
        );
    }
}

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
                                label={lang.User.account}
                                value={field[key]}
                                onChange={(event) => { model.changeValue(key, event.target.value); }}
                            />
                        );
                    }} />

                    <MyForm fieldKey='password' model={model} renderChild={(key) => {
                        return (
                            <TextField
                                required
                                label={lang.User.password}
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
                                children: lang.User.operate.signIn
                            }
                        }
                    >
                    </MyButton>
                </Grid>
            </Grid >
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
    submit: {
        marginTop: theme.spacing.unit * 3,
    },
});

type SignUpInnerProps = RouteComponentProps<{}> & WithStyles<typeof signUpStyles>;

@withStylesDeco(signUpStyles)
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
        let { account, password, nickname } = this.model.field;
        try {
            if (!this.model.validAll())
                return;
            await testApi.userSignUp({ account, password, nickname });
            msgNotice(lang.User.operate.signUpSuccess, { snackbarVariant: 'success', autoHideDuration: 3000 }).waitClose().then(() => {
                history.push({ pathname: routeConfig.index });
            });
        } catch (e) {
            msgNotice(e.message);
        }
    }

    render() {
        const { classes } = this.innerProps;
        const { model } = this;
        let field = model.field;
        return (
            <Dialog>
                <MyForm fieldKey='account' model={model} renderChild={(key) => {
                    return (
                        <TextField
                            autoFocus
                            required
                            label={lang.User.account}
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
                            label={lang.User.nickname}
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
                            label={lang.User.password}
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
                            label={lang.User.confirmPassword}
                            fullWidth
                            value={field[key]}
                            type='password'
                            onChange={(event) => { model.changeValue(key, event.target.value); }}
                        />
                    );
                }
                } />
                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={this.signUp}>
                    {lang.User.operate.signUp}
                </Button>
            </Dialog>
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
        if (main.user.isLogin) {
            return (
                <Paper style={{ padding: 10 }}>
                    <Grid container direction="row">
                        <Grid container item xs={1} justify="flex-end" className={classes.firstCol}>
                            {lang.User.account}
                        </Grid>
                        <Grid item>
                            {main.user.account}
                        </Grid>
                    </Grid>

                    <Grid container direction="row">
                        <Grid container item xs={1} justify="flex-end" className={classes.firstCol}>
                            {lang.User.nickname}
                        </Grid>
                        <Grid item>
                            {main.user.nickname}
                        </Grid>
                    </Grid>
                </Paper>
            );
        } else {
            return (
                <Dialog>
                    <SignIn />
                </Dialog>
            );
        }
    }
}