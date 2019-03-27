import * as React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import { TextTransformProperty } from 'csstype';
import * as moment from 'moment';

import './styles.css';
import config from './config';
import App from './modules/main/App';
import { Test } from './modules/test/model';

// configure({ enforceActions: 'always' });
document.title = config.title;
const store = {
    test: new Test()
}

const customTheme = {
    typography: {
        useNextVariants: true,
    },
    overrides: {
        MuiButton: {
            root: {
                textTransform: 'none' as TextTransformProperty
            }
        }
    }
};
export function withCustomTheme(child) {
    return (
        <MuiThemeProvider theme={createMuiTheme(customTheme)}>
            {child}
        </MuiThemeProvider>
    );
}
render((
    <Provider {...store}>
        <Router>
            {withCustomTheme(<App />)}
        </Router>
    </Provider>
), document.getElementById('main'));