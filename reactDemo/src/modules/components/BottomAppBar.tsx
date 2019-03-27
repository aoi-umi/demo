import * as React from 'react';

import classNames from 'classnames';

import { WithStyles, createStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core';

import AppBar from '@material-ui/core/AppBar';
import Slide from '@material-ui/core/Slide';
import Toolbar from '@material-ui/core/Toolbar';

import { withStylesDeco } from '../../helpers/util';

import { main } from '../main/constant';

const styles = (theme: Theme) => {
    const drawerWidth = main.drawerWidth;

    return createStyles({
        leftBlock: {
            width: theme.spacing.unit * 9,
            [theme.breakpoints.down('sm')]: {
                width: 0,
            },
            transition: theme.transitions.create(['width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },
        leftBlockShift: {
            width: drawerWidth,
            [theme.breakpoints.down('sm')]: {
                width: 0,
            },
            transition: theme.transitions.create(['width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        bottomAppBar: {
            top: 'auto',
            bottom: 0,
            position: 'fixed',
            padding: `${1 * theme.spacing.unit}px ${2 * theme.spacing.unit}px`
        },
        bottomAppBarShift: {
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

type BottomAppBarProps = {
    in?: boolean;
}
type InnerProps = BottomAppBarProps & WithStyles<typeof styles, true>;
@withStylesDeco(styles, { withTheme: true })
export class BottomAppBar extends React.Component<BottomAppBarProps> {
    private get innerProps() {
        return this.props as InnerProps;
    }
    render() {
        let { classes } = this.innerProps;
        return (
            <Slide direction="up" in={this.props.in} mountOnEnter unmountOnExit>
                <AppBar color="inherit" className={classNames(classes.bottomAppBar)}>
                    <Toolbar>
                        <div className={classNames(classes.leftBlock, main.open && classes.leftBlockShift)}></div>
                        {this.props.children}
                    </Toolbar>
                </AppBar>
            </Slide>
        );
    }
}