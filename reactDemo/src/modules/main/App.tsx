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
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { WithWidth, isWidthDown } from "@material-ui/core/withWidth";

import { Route, Switch, RouteComponentProps, NavLink } from 'react-router-dom';
import { observer } from 'mobx-react';

import lang from '../../lang';
import { withStylesDeco, withRouterDeco, withWidthDeco } from '../../helpers/util';
import { msgNotice } from '../../helpers/common';
import { NotMatch } from '../error';
import { testApi } from '../api';
import {
    MainSection as TestMainSection,
    model as testModel,
} from '../test';

import {
    SignIn, SignUp, Account
} from '../user';

import BookMark from '../bookmark';
import { main, routeConfig, cacheKey, mainFolderListItems } from './constant';
//#region route
const routes: {
    path?: string,
    comp: JSX.Element,
    title?: string,
    exact?: boolean,
}[] = [{
    path: routeConfig.index,
    comp: <BookMark />,
    title: lang.App.routes.bookmark,
}, {
    path: routeConfig.bookmark,
    comp: <BookMark />,
    title: lang.App.routes.bookmark,
}, {
    path: routeConfig.userSignUp,
    comp: <SignUp />,
    title: lang.App.routes.userSignUp,
}, {
    path: routeConfig.userAccount,
    comp: <Account />,
    title: lang.App.routes.userAccount,
}, {
    path: routeConfig.test,
    comp: <TestMainSection />,
    title: 'test',
}, {
    comp: <NotMatch />,
    title: lang.App.routes.notFound,
}];
//#endregion

//#region style 

const styles = (theme: Theme) => {
    const drawerWidth = main.drawerWidth;

    return createStyles({
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
        bottomAppBar: {
            top: 'auto',
            bottom: 0,
            position: 'fixed',
            paddingRight: theme.spacing.unit * 2,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            width: `calc(100% - ${theme.spacing.unit * 9}px)`,
            [theme.breakpoints.down('sm')]: {
                width: '100%',
            },
            padding: `${1 * theme.spacing.unit}px ${2 * theme.spacing.unit}px`
        },
        bottomAppBarShift: {
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
};

//#endregion 
type AppProps = {
}
type InnerProps = RouteComponentProps<AppProps> & WithStyles<typeof styles, true> & WithWidth;

@withWidthDeco()
@withStylesDeco(styles, { withTheme: true })
@withRouterDeco
@observer
export default class App extends React.Component<AppProps, { anchorEl?: any }> {
    private get innerProps() {
        return this.props as InnerProps;
    }
    dataSource = main;

    constructor(props) {
        super(props);
        this.init();
    }

    async init() {
        this.state = {};
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

    handleMenu = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    signOut = () => {
        this.handleClose();
        testApi.userSignOut().then(() => {
            this.dataSource.user.init();
            localStorage.removeItem(cacheKey.testUser);
        }).catch(e => {
            msgNotice(e.message);
        });
    };

    toMyAccount = () => {
        const { history } = this.innerProps;
        this.handleClose();
        history.push({ pathname: routeConfig.userAccount });
    }

    renderTop() {
        const { classes, history } = this.innerProps;
        const { dataSource } = this;
        const { anchorEl } = this.state;
        const open = Boolean(anchorEl);
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
                                <div style={{ cursor: 'pointer', marginRight: 5 }}>
                                    <div onClick={this.handleMenu}>
                                        <IconButton
                                            aria-haspopup="true"
                                            color="inherit"
                                            style={{ marginRight: 5 }}
                                        >
                                            <AccountCircle />
                                        </IconButton>
                                        {dataSource.user.nickname}
                                    </div>
                                    <Menu
                                        id="menu-appbar"
                                        anchorEl={anchorEl}
                                        anchorOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        open={open}
                                        onClose={this.handleClose}
                                    >
                                        <MenuItem onClick={this.toMyAccount}>{lang.User.operate.myAccount}</MenuItem>
                                        <MenuItem onClick={this.signOut}>{lang.User.operate.signOut}</MenuItem>
                                    </Menu>
                                </div> :
                                <div>
                                    <Button color="inherit" onClick={() => {
                                        let notice = msgNotice(
                                            <SignIn
                                                onSignInSuccess={() => {
                                                    notice.close();
                                                }}
                                            />, {
                                                type: 'dialog',
                                                dialogTitle: lang.User.operate.signIn,
                                                dialogBtnList: []
                                            });
                                    }}>
                                        {lang.User.operate.signIn}
                                    </Button>
                                    <Button color="inherit" onClick={() => {
                                        history.push({ pathname: routeConfig.userSignUp });
                                    }}>
                                        {lang.User.operate.signUp}
                                    </Button>
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
                        <List>{mainFolderListItems(history)}</List>
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
                {render()}
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
                                return ele.comp;
                            }} />);
                })}
            </Switch>
        );
    }
    render() {
        const { classes } = this.innerProps;
        const { dataSource } = this;
        return (
            <div className={classes.root}>
                {this.renderTop()}
                {this.renderMenu()}
                <main className={classes.content}>
                    <div style={{ marginBottom: 10 }}>
                        {this.renderRoute()}
                    </div>
                </main>
            </div>
        );
    }
}

const bottomAppBarStyles = (theme: Theme) => {
    const drawerWidth = main.drawerWidth;

    return createStyles({
        bottomAppBar: {
            top: 'auto',
            bottom: 0,
            position: 'fixed',
            paddingRight: theme.spacing.unit * 2,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            width: `calc(100% - ${theme.spacing.unit * 9}px)`,
            [theme.breakpoints.down('sm')]: {
                width: '100%',
            },
            padding: `${1 * theme.spacing.unit}px ${2 * theme.spacing.unit}px`
        },
        bottomAppBarShift: {
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
    });
};
