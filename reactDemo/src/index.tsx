import * as React from 'react';
import { render } from 'react-dom';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
configure({ enforceActions: 'always' });

import './styles.css';
import App from './modules/main/components/App';
import { Test } from './modules/test/model';

document.title = 'Title';
const store = {
    test: new Test()
}
render((
    <Provider {...store}>
        <App />
    </Provider>
), document.getElementById('main'));