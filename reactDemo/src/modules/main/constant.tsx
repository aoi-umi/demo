
import * as React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HomeIcon from '@material-ui/icons/Home';
import PeopleIcon from '@material-ui/icons/People';
import { History } from 'history';

import lang from '../../lang';
import { Main } from './model';

export const main = new Main();

export const routeConfig = {
    index: '/',
    //个人中心
    userAccount: '/user/account',
    userSignUp: '/user/signUp',
    //管理
    adminUser: '/user',
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
            <ListItemText primary={lang.App.menu.home} />
        </ListItem>
        <ListItem button onClick={() => {
            onClick(routeConfig.adminUser);
        }} >
            <ListItemIcon>
                <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary={lang.App.menu.user} />
        </ListItem>
    </div>);
};
