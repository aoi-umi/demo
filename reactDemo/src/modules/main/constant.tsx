
import * as React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HomeIcon from '@material-ui/icons/Home';
import DraftsIcon from '@material-ui/icons/Drafts';
import StarIcon from '@material-ui/icons/Star';
import SendIcon from '@material-ui/icons/Send';
import MailIcon from '@material-ui/icons/Mail';
import DeleteIcon from '@material-ui/icons/Delete';
import ReportIcon from '@material-ui/icons/Report';
import { History } from 'history';

export const routeConfig = {
    index: '/',
    bookmark: '/bookmark',
    signUp: '/sginUp',
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
