import * as React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
configure({ enforceActions: 'always' });

import './styles.css';
import config from './config';
import App from './modules/main/components/App';
import { Test } from './modules/test/model';

document.title = config.title;
const store = {
    test: new Test()
}
render((
    <Provider {...store}>
        <Router>
            <App />
        </Router>
    </Provider>
), document.getElementById('main'));