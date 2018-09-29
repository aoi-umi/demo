import { handleActions, Action } from 'redux-actions';

import { Test, IState } from './model';
import {
    BUTTON_CLICK,
    TEXT_CLICK,
} from './constants/ActionTypes';

const initialState: IState = {
    text: 'world',
    count: 0
};

export default handleActions<IState, any>({
    [BUTTON_CLICK]: (state) => {
        return {
            ...state,
            count: state.count + 1,
        };
    },

    [TEXT_CLICK]: (state, action: Action<string>) => {
        return {
            ...state,
            text: (action.payload || state.text),
        };
    },
}, initialState);
