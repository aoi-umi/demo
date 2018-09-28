import * as React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router, Route, Switch, withRouter } from 'react-router-dom';
import App from './modules/app';
import { Test, Test2 } from './modules/test';
import { NotMatch, ErrorHandler } from './modules/error';

import './styles.css';
import { withRouterDeco } from './helpers/util';

document.title = 'Title';
let page = [{
    path: '/',
    comp: <Test />,
    title: 'test',
}, {
    path: '/test2',
    comp: <Test2 />,
    title: 'test2',
}, {
    comp: <NotMatch />,
    title: 'Not Found',
}];

class Index extends React.Component {
    state = {
        title: 'Index'
    };

    setTitle = (title) => {
        if (title != this.state.title) {
            //不加会报错
            setTimeout(() => {
                this.setState({ title });
            }, 0);
        }
    }
    render() {
        let setTitle = this.setTitle;
        return (
            <ErrorHandler>
                <App title={this.state.title}>
                    <Router>
                        <Switch>
                            {
                                page.map((ele, i) => {
                                    return <Route key={i} exact path={ele.path || null} render={() => {
                                        setTitle(ele.title);
                                        return ele.comp;
                                    }}></Route>
                                })
                            }
                        </Switch>
                    </Router>
                </App>
            </ErrorHandler>
        )
    }
}
render((<Index />), document.getElementById('main'));