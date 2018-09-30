import * as React from 'react';
import { render } from 'react-dom';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
configure({ enforceActions: 'always' });

import './styles.css';
import App from './modules/main/components/App';

document.title = 'Title';
render((
    <Provider store={{}}>
        <App />
    </Provider>
), document.getElementById('main'));