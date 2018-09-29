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
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Action } from 'redux-actions';
import { HashRouter as Router, Route, Switch, withRouter } from 'react-router-dom';

import { mailFolderListItems, otherMailFolderListItems } from '../constants/tileData';
import { withStylesDeco, connectDeco } from '../../../helpers/util';
import { NotMatch } from '../../error';
import {
    MainSection as TestMainSection,
    mapDispatchToProps,
    model,
    DispatchResult
} from '../../test';

import Test2 from '../../test2';


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

type AppProps = {
    title?: string,
    test?: number,
}
type Props = {
    test: model.Test,
} & AppProps & DispatchResult & WithStyles<typeof styles, true>;


const mapStateToProps = state => ({
    test: state.test,
    main: state.main,
});

@connectDeco(mapStateToProps, mapDispatchToProps)
@withStylesDeco(styles, { withTheme: true })
export default class App extends React.Component<AppProps> {
    state = {
        open: false,
    };

    handleDrawerOpen = () => {
        this.setState({ open: true });
    };

    handleDrawerClose = () => {
        this.setState({ open: false });
    };
    renderTop() {
        const { classes, title } = this.props as Props;
        return (
            <AppBar
                position="absolute"
                className={classNames(classes.appBar, this.state.open && classes.appBarShift)}
            >
                <Toolbar disableGutters={!this.state.open}>
                    <IconButton
                        color="inherit"
                        aria-label="Open drawer"
                        onClick={this.handleDrawerOpen}
                        className={classNames(classes.menuButton, this.state.open && classes.hide)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Tooltip title="这是个提示" placement="bottom">
                        <Typography variant="title" color="inherit" noWrap>
                            {title}
                        </Typography>
                    </Tooltip>
                </Toolbar>
            </AppBar>
        );
    }
    renderMenu() {
        const { classes, theme } = this.props as Props;
        return (
            <Drawer
                variant="permanent"
                classes={{
                    paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
                }}
                open={this.state.open}
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
        const { test, btnClick, textClick } = this.props as Props;
        return (
            <Router>
                <Switch>
                    {[{
                        path: '/',
                        comp:
                            <TestMainSection
                                test={test}
                                btnClick={btnClick}
                                textClick={textClick}
                            />,
                        title: 'test',
                    }, {
                        path: '/test2',
                        comp: <Test2 />,
                        title: 'test2',
                    }, {
                        comp: <NotMatch />,
                        title: 'Not Found',
                    }].map((ele, i) => {
                        return <Route key={i} exact path={ele.path || null} render={() => {
                            //this.setState({ title: ele.title });
                            //dispatch(btnClick());
                            return ele.comp;
                        }}></Route>
                    })}
                </Switch>
            </Router>

        );
    }
    render() {
        const { classes } = this.props as Props;
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