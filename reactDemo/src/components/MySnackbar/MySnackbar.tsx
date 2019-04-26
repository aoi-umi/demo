import * as React from 'react';
import classNames from 'classnames';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import WarningIcon from '@material-ui/icons/Warning';

import { Theme } from '@material-ui/core';
import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';
import IconButton from '@material-ui/core/IconButton';
import Snackbar, { SnackbarOrigin } from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { WithStyles } from '@material-ui/core';

import { observer, inject } from 'mobx-react';
import { withStylesDeco } from '../../helpers/util';
import { MySnackbarModel } from './model';

const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
};

const styles = (theme: Theme) => ({
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
        fontSize: 15,
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

export type MySnackbarVariantType = 'success' | 'warning' | 'error' | 'info';
type MySnackbarProps = {
    className?: any,
    message?: any,
    noClose?: boolean,
    onClose?: (event) => void,
    variant?: MySnackbarVariantType,
    autoHideDuration?: number,
} & Partial<SnackbarOrigin>;
type InnerProps = MySnackbarProps & WithStyles<typeof styles>;

@withStylesDeco(styles)
@observer
export default class MySnackbar extends React.Component<MySnackbarProps> {
    private get innerProps() {
        return this.props as InnerProps;
    }
    private model = new MySnackbarModel();
    private onClose = (event) => {
        this.model.toggle(false);
        this.props.onClose && this.props.onClose(event);
    }
    render() {
        const { classes, className, message, variant, noClose } = this.innerProps;
        const Icon = variantIcon[variant];
        return (
            <Snackbar
                anchorOrigin={{
                    vertical: this.props.vertical || 'top',
                    horizontal: this.props.horizontal || 'center',
                }}
                open={this.model.open}
                autoHideDuration={this.props.autoHideDuration || 6000}
                onClose={this.onClose}
                style={{ margin: 5 }}
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
                        noClose ? null : (
                            <IconButton
                                key="close"
                                aria-label="Close"
                                color="inherit"
                                onClick={this.onClose}
                            >
                                <CloseIcon className={classes.icon} />
                            </IconButton>
                        ),
                    ]}
                />
            </Snackbar>
        );
    }
}