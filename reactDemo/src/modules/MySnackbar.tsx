import * as React from 'react';
import * as PropTypes from 'prop-types';
import classNames from 'classnames';
import Button from '@material-ui/core/Button';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';
import IconButton from '@material-ui/core/IconButton';
import Snackbar, { SnackbarOrigin } from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import { withStyles, StyleRulesCallback } from '@material-ui/core/styles';
import { withStylesDeco } from '../helpers/util';

const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
};

const styles1 = theme => ({
    success: {
        backgroundColor: green[600],
    },
    error: {
        backgroundColor: theme.palette.error.dark,
    },
    info: {
        backgroundColor: theme.palette.primary.dark,
    },
    warning: {
        backgroundColor: amber[700],
    },
    icon: {
        fontSize: 20,
    },
    iconVariant: {
        opacity: 0.9,
        marginRight: theme.spacing.unit,
    },
    message: {
        display: 'flex',
        alignItems: 'center',
    },
});

@withStylesDeco(styles1)
export default class MySnackbar extends React.Component<{
    classes?: any,
    className?: any,
    message?: any,
    onClose?: (event) => void,
    variant?: 'success' | 'warning' | 'error' | 'info',
    autoHideDuration?: number,
} & Partial<SnackbarOrigin>> {
    state = {
        open: true,
    }
    private onClose = (event) => {
        this.setState({ open: false }, () => {
            this.props.onClose && this.props.onClose(event);
        });
    }
    public render() {
        const { classes, className, message, variant, ...other } = this.props;
        const Icon = variantIcon[variant];

        return (
            <Snackbar
                anchorOrigin={{
                    vertical: this.props.vertical || 'top',
                    horizontal: this.props.horizontal || 'center',
                }}
                open={this.state.open}
                autoHideDuration={this.props.autoHideDuration || 6000}
                onClose={this.onClose}
            >
                <SnackbarContent
                    className={classNames(classes[variant], className)}
                    aria-describedby="client-snackbar"
                    message={
                        <span id="client-snackbar" className={classes.message}>
                            <Icon className={classNames(classes.icon, classes.iconVariant)} />
                            {message}
                        </span>
                    }
                    action={[
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            className={classes.close}
                            onClick={this.onClose}
                        >
                            <CloseIcon className={classes.icon} />
                        </IconButton>,
                    ]}
                    {...other}
                />
            </Snackbar>
        );
    }
}