import { createAction } from 'redux-actions';

import { Test } from './model';

import {
    BUTTON_CLICK,
    TEXT_CLICK,
} from './constants/ActionTypes';

export interface DispatchResult {
    btnClick: () => any
    textClick: (text?: string) => any,
}

export function mapDispatchToProps(dispatch): DispatchResult {
    return {
        btnClick: () => dispatch(
            createAction(
                BUTTON_CLICK
            )()),

        textClick: (text: string) => dispatch(
            createAction<string, string>(
                TEXT_CLICK,
                (newText?: string) => newText
            )(text))
    }
}
