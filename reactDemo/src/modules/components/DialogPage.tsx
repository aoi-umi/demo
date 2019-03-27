import * as React from 'react';
import { ReactNode } from 'react';
import Paper from '@material-ui/core/Paper';
import { WithStyles, Theme } from '@material-ui/core';


import { withStylesDeco } from '../../helpers';


const dialogStyles = (theme: Theme) => ({
    main: {
        width: 'auto',
        display: 'block' as any, // Fix IE 11 issue.
        [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
            width: 400,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    paper: {
        marginTop: theme.spacing.unit * 8,
        display: 'flex' as any,
        flexDirection: 'column' as any,
        alignItems: 'center' as any,
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
    },
    avatar: {
        margin: theme.spacing.unit,
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing.unit,
    },
});
type DialogProps = React.HTMLAttributes<HTMLElement>;
type DialogInnerProps = DialogProps & WithStyles<typeof dialogStyles>;


@withStylesDeco(dialogStyles)
export class DialogPage extends React.Component<DialogProps> {
    private get innerProps() {
        return this.props as DialogInnerProps;
    }
    render() {
        const { classes, children, ...restProps } = this.innerProps;
        return (
            <main className={classes.main} {...restProps}>
                <Paper className={classes.paper}>
                    <form className={classes.form}>
                        {children}
                    </form>
                </Paper>
            </main>
        );
    }
}