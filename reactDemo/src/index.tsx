import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Store, createStore } from 'redux';

import './styles.css';
import rootReducer from './modules/main/reducer';
import App from './modules/main/components/App';

document.title = 'Title';
const initialState = {};
const store: Store<any> = createStore(rootReducer, initialState);
render((
    <Provider store={store}>
        <App />
    </Provider>
), document.getElementById('main'));