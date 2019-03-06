import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import * as util from '../../helpers/util';
import { msgNotice } from '../../helpers/common';
import { cacheKey } from '../main/components/App';
import { User } from '../main/model';
import { testApi } from '../api';
import { SignInModel } from './model';

type DetailProps = {
    user?: User;
    onSignInSuccess?: () => void;
}
export class SignIn extends React.Component<DetailProps>{
    model: SignInModel;

    constructor(props, context) {
        super(props, context);
        this.model = new SignInModel();
    }

    signIn = async () => {
        let { user, onSignInSuccess } = this.props;
        let { account, password } = this.model;
        let req = { account, rand: util.randStr() };
        let token = req.account + util.md5(password) + JSON.stringify(req);
        try {
            token = util.md5(token);
            localStorage.setItem(cacheKey.testUser, token);
            let t = await testApi.userSignIn(req);
            user && user.init(t);
            onSignInSuccess && onSignInSuccess();
        } catch (e) {
            msgNotice(e.message);
        }
    }

    render() {
        let { model } = this;
        return (
            <Grid container spacing={16}>
                <Grid item container>
                    <TextField
                        autoFocus
                        required
                        label="账号"
                        fullWidth
                        value={model.account}
                        onChange={(event) => { model.changeValue('account', event.target.value); }}
                    />
                    <TextField
                        required
                        label="密码"
                        fullWidth
                        value={model.password}
                        type='password'
                        onChange={(event) => { model.changeValue('password', event.target.value); }}
                    />
                </Grid>
                <Grid item container xs={12}>
                    <Button fullWidth={true} onClick={this.signIn}>
                        登录
                    </Button>
                </Grid>
            </Grid>
        );
    }
}