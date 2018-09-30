import * as React from 'react';
import * as PropTypes from 'prop-types';
import classNames from 'classnames';

import { withStyles, WithStyles, createStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';

import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { HashRouter as Router, Route, Switch, withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';

import { mailFolderListItems, otherMailFolderListItems } from '../constants/tileData';
import { withStylesDeco } from '../../../helpers/util';
import { NotMatch } from '../../error';
import {
    MainSection as TestMainSection,
    model as testModel,
} from '../../test';

import Test2 from '../../test2';
import * as appModel from '../model';

//#region route
const routes: {
    path?: string,
    comp: JSX.Element,
    title?: string,
    exact?: boolean,
}[] = [{
    path: '/',
    comp: <TestMainSection />,
    title: 'test',
}, {
    path: '/test2',
    comp: <Test2 />,
    title: 'test2',
}, {
    path: '/test2/:p1/:p2?',
    comp: <Test2 />,
    title: 'test2//',
}, {
    comp: <NotMatch />,
    title: 'Not Found',
}];
//#endregion

//#region style 
const drawerWidth = 240;

const styles = (theme: Theme) => createStyles({
    root: {
        flexGrow: 1,
        height: '100%',
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginLeft: 12,
        marginRight: 36,
    },
    hide: {
        display: 'none',
    },
    drawerPaper: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing.unit * 7,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing.unit * 9,
        },
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
        backgroundColor: theme.palette.primary.main
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit,
        marginTop: theme.mixins.toolbar.minHeight,
    },
});

//#endregion 
type AppProps = {
}
type InnerProps = AppProps & WithStyles<typeof styles, true> & {
    test: testModel.Test
};

@withStylesDeco(styles, { withTheme: true })
@observer
export default class App extends React.Component<AppProps> {
    private get innerProps() {
        return this.props as InnerProps;
    }
    dataSource = new appModel.Main();

    handleDrawerOpen = () => {
        this.dataSource.toggleDrawer(true);
    };

    handleDrawerClose = () => {
        this.dataSource.toggleDrawer(false);
    };
    renderTop() {
        const { classes } = this.innerProps;
        const { dataSource } = this;
        return (
            <AppBar
                position="absolute"
                className={classNames(classes.appBar, dataSource.open && classes.appBarShift)}
            >
                <Toolbar disableGutters={!dataSource.open}>
                    <IconButton
                        color="inherit"
                        aria-label="Open drawer"
                        onClick={this.handleDrawerOpen}
                        className={classNames(classes.menuButton, dataSource.open && classes.hide)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Tooltip title="这是个提示" placement="bottom">
                        <Typography variant="title" color="inherit" noWrap>
                            {dataSource.title}
                        </Typography>
                    </Tooltip>
                </Toolbar>
            </AppBar>
        );
    }
    renderMenu() {
        const { classes, theme } = this.innerProps;
        const { dataSource } = this;
        return (
            <Drawer
                variant="permanent"
                classes={{
                    paper: classNames(classes.drawerPaper, !dataSource.open && classes.drawerPaperClose),
                }}
                open={dataSource.open}
            >
                <div className={classes.toolbar}>
                    <IconButton onClick={this.handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </div>
                <Divider />
                <List>{mailFolderListItems}</List>
                <Divider />
                <List>{otherMailFolderListItems}</List>
            </Drawer>
        );
    }
    renderRoute() {
        const { } = this.innerProps;
        const { dataSource } = this;
        return (
            <Router>
                <Switch>
                    {routes.map((ele, i) => {
                        return <Route key={i} exact={ele.exact === false ? false : true} path={ele.path || null} render={() => {
                            dataSource.setTitle(ele.title);
                            return ele.comp;
                        }}></Route>
                    })}
                </Switch>
            </Router>

        );
    }
    render() {
        const { classes } = this.innerProps;
        return (
            <div className={classes.root}>
                {this.renderTop()}
                {this.renderMenu()}
                <main className={classes.content}>
                    {this.renderRoute()}
                </main>
            </div>
        );
    }
}