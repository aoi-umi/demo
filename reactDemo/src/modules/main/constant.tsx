
import * as React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HomeIcon from '@material-ui/icons/Home';
import { History } from 'history';

import { Main } from './model';

export const main = new Main();

export const routeConfig = {
    index: '/',
    //个人中心
    userAccount: '/user/account',
    userSignUp: '/user/signUp',
    bookmark: '/bookmark',
    test: '/test',
};

export const cacheKey = {
    testUser: 'userCacheKey',
};

export const mainFolderListItems = (history: History) => {
    function onClick(path) {
        if (history.location.pathname != path)
            history.push(path);
    }
    return (<div>
        <ListItem button onClick={() => {
            onClick(routeConfig.bookmark);
        }} >
            <ListItemIcon>
                <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
        </ListItem>
    </div>);
};
