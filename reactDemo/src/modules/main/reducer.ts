import { combineReducers } from 'redux';
import { handleActions, Action } from 'redux-actions';

import test from '../test';

import { IState } from './model';
import {
    UPDATE_TITLE,
} from './constants/ActionTypes';
const initialState: IState = {
    title: 'title',
};

const main = handleActions<IState, any>({
    [UPDATE_TITLE]: (state, action: Action<string>) => {
        return {
            ...state,
            title: action.payload
        };
    },
}, initialState);

const rootReducer = combineReducers({
    test,
    main
});

export default rootReducer;
