import { createAction } from 'redux-actions';

import {
    UPDATE_TITLE,
} from './constants/ActionTypes';
import { Main } from './model';

export const updateTitle = createAction<string, string>(
    UPDATE_TITLE,
    (title?: string) => title
);

