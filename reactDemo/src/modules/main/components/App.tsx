import * as React from 'react';
import classNames from 'classnames';

import { WithStyles, createStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import Button from '@material-ui/core/Button';

import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { WithWidth, isWidthDown } from "@material-ui/core/withWidth";

import { Route, Switch, RouteComponentProps } from 'react-router-dom';
import { observer } from 'mobx-react';

import { mailFolderListItems, otherMailFolderListItems } from '../constants/tileData';
import { routeConfig } from '../constants/route';
import { withStylesDeco, withRouterDeco, withWidthDeco } from '../../../helpers/util';
import * as util from '../../../helpers/util';
import { NotMatch } from '../../error';
import {
    MainSection as TestMainSection,
    model as testModel,
} from '../../test';

import BookMark from '../../bookmark';
import * as appModel from '../model';
import { testApi } from '../../api';

export let cacheKey = {
    testUser: 'userCacheKey',
};

//#region route
const routes: {
    path?: string,
    comp: JSX.Element,
    title?: string,
    exact?: boolean,
}[] = [{
    path: routeConfig.index,
    comp: <BookMark />,
    title: '书签',
}, {
    path: routeConfig.bookmark,
    comp: <BookMark />,
    title: '书签',
}, {
    path: routeConfig.test,
    comp: <TestMainSection />,
    title: 'test',
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
        paddingRight: theme.spacing.unit * 2
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
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
    //侧边栏
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
        width: theme.spacing.unit * 9,
        [theme.breakpoints.down('sm')]: {
            width: 0,
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
        padding: `${4 * theme.spacing.unit}px ${2 * theme.spacing.unit}px`,
        marginTop: theme.mixins.toolbar.minHeight,
        overflow: 'auto',
    },
});

//#endregion 
type AppProps = {
}
type InnerProps = RouteComponentProps<AppProps> & WithStyles<typeof styles, true> & WithWidth & {
    test: testModel.Test
};

@withWidthDeco()
@withStylesDeco(styles, { withTheme: true })
@withRouterDeco
@observer
export default class App extends React.Component<AppProps> {
    private get innerProps() {
        return this.props as InnerProps;
    }
    dataSource = new appModel.Main();

    constructor(props) {
        super(props);
        this.init();
    }

    async init() {
        let token = localStorage.getItem(cacheKey.testUser);
        if (token) {
            let user = await testApi.userInfo();
            if (user)
                this.dataSource.user.init(user);
        }
    }

    handleDrawerOpen = () => {
        this.dataSource.toggleDrawer(true);
    };

    handleDrawerClose = () => {
        this.dataSource.toggleDrawer(false);
    };
    renderTop() {
        const { classes, history } = this.innerProps;
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
                    <Typography variant="h6" color="inherit" noWrap style={{ flexGrow: 1 }}>
                        {dataSource.title}
                    </Typography>
                    <Typography variant="h6" color="inherit" noWrap>
                        {
                            dataSource.user.isLogin ?
                                <div style={{ cursor: 'pointer' }}>
                                    <IconButton
                                        aria-haspopup="true"
                                        color="inherit"
                                        style={{ marginRight: 5 }}
                                    >
                                        <AccountCircle />
                                    </IconButton>
                                    {dataSource.user.nickname}
                                </div> :
                                <div>
                                    <Button color="inherit" onClick={() => {
                                        let req = { account: 'test', rand: util.randStr() };
                                        let token = req.account + util.md5('123456') + JSON.stringify(req);

                                        token = util.md5(token);
                                        localStorage.setItem(cacheKey.testUser, token);
                                        testApi.userSignIn(req);
                                    }}>Login</Button>
                                    <Button color="inherit" onClick={() => {
                                        testApi.userSignUp({ account: 'test', nickname: 'test', password: '123456' });
                                    }}>SignUp</Button>
                                </div>
                        }
                    </Typography>
                </Toolbar>
            </AppBar>
        );
    }
    renderMenu() {
        const { classes, theme, history, width } = this.innerProps;
        const { dataSource } = this;
        let isSm = isWidthDown('sm', width);
        let self = this;
        function render() {
            return (
                <div>
                    <div className={classes.toolbar}>
                        <IconButton onClick={self.handleDrawerClose}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </div>
                    <div onClick={() => {
                        if (isSm)
                            self.handleDrawerClose();
                    }}>
                        <Divider />
                        <List>{mailFolderListItems(history)}</List>
                        <Divider />
                        <List>{otherMailFolderListItems}</List>
                    </div>
                </div>
            );
        }
        if (isSm) {
            return (
                <SwipeableDrawer
                    open={dataSource.open}
                    onOpen={() => { }}
                    onClose={this.handleDrawerClose}
                >
                    {render()}
                </SwipeableDrawer>
            )
        }
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
                        <ChevronLeftIcon />
                    </IconButton>
                </div>
                <Divider />
                <List>{mailFolderListItems(history)}</List>
                <Divider />
                <List>{otherMailFolderListItems}</List>
            </Drawer>
        );
    }
    renderRoute() {
        const { } = this.innerProps;
        const { dataSource } = this;
        return (
            <Switch>
                {routes.map((ele, i) => {
                    return (
                        <Route key={i}
                            exact={ele.exact === false ? false : true}
                            path={ele.path || null}
                            render={() => {
                                dataSource.setTitle(ele.title);
                                return <div style={{ marginBottom: 10 }}>{ele.comp}</div>;
                            }} />);
                })}
            </Switch>

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