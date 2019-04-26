import 'babel-polyfill';
import * as React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import { SnackbarProvider } from 'notistack';
import DateMomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider, } from "material-ui-pickers";

import './styles.css';
import config from './config/env';
import App from './modules/main/App';
import { Test } from './modules/test/model';
import { withCustomTheme } from './helpers';

// configure({ enforceActions: 'always' });
document.title = config.title;
const storage = {
    test: new Test()
}

render((
    <Provider {...storage}>
        <Router>
            <MuiPickersUtilsProvider utils={DateMomentUtils}>
                <SnackbarProvider maxSnack={5}>
                    {withCustomTheme(<App />)}
                </SnackbarProvider>
            </MuiPickersUtilsProvider>
        </Router>
    </Provider>
), document.getElementById('main'));