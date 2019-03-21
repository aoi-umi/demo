import * as React from 'react';

import classNames from 'classnames';

import { WithStyles, createStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core';

import AppBar from '@material-ui/core/AppBar';
import Slide from '@material-ui/core/Slide';

import { withStylesDeco } from '../../helpers/util';

import { main } from './constant';

const styles = (theme: Theme) => {
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

type BottomAppBarProps = {
    in?: boolean;
}
type InnerProps = BottomAppBarProps & WithStyles<typeof styles, true>;
@withStylesDeco(styles, { withTheme: true })
export default class BottomAppBar extends React.Component<BottomAppBarProps> {
    private get innerProps() {
        return this.props as InnerProps;
    }
    render() {
        let { classes } = this.innerProps;
        return (
            <Slide direction="up" in={this.props.in} mountOnEnter unmountOnExit>
                <AppBar color="inherit" className={classNames(classes.bottomAppBar, main.open && classes.bottomAppBarShift)}>
                    {this.props.children}
                </AppBar>
            </Slide>
        );
    }
}