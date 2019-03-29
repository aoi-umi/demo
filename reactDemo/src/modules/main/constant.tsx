
import * as React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HomeIcon from '@material-ui/icons/Home';
import PeopleIcon from '@material-ui/icons/People';
import LockIcon from '@material-ui/icons/Lock';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import { History } from 'history';

import lang from '../../lang';
import { Main } from './model';
import { routeConfig } from '../../config/config';

export const main = new Main();

export const mainFolderListItems = (history: History) => {
    function onClick(path: string) {
        if (history.location.pathname != path)
            history.push(path);
    }

    return (
        <div>
            {[{
                route: routeConfig.bookmark,
                icon: <HomeIcon />,
                primary: lang.App.menu.home
            }, {
                route: routeConfig.adminUser,
                icon: <PeopleIcon />,
                primary: lang.App.menu.user
            }, {
                route: routeConfig.role,
                icon: <PermIdentityIcon />,
                primary: lang.App.menu.role
            }, {
                route: routeConfig.authority,
                icon: <LockIcon />,
                primary: lang.App.menu.authority
            }].map((ele, idx) => {
                return (
                    <ListItem key={idx} button onClick={() => {
                        onClick(ele.route.path);
                    }} >
                        <ListItemIcon>
                            {ele.icon}
                        </ListItemIcon>
                        <ListItemText primary={ele.primary} />
                    </ListItem>
                );
            })}
        </div>);
};
