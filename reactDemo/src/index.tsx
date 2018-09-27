import * as React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import App from './modules/app';
import { Test, Test2 } from './modules/test';
import { NotMatch } from './modules/error';

import './styles.css';

const setTitle = (title) => {
    document.title = title
};
setTitle('Index');
render((
    <App>
        <Router>
            <Switch>
                <Route exact path="/" component={Test} />
                <Route exact path="/test2" component={Test2} />
                <Route component={NotMatch} />
            </Switch>
        </Router>
    </App>
), document.getElementById('app'))