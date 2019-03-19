
import * as React from 'react';

import { PositionProperty } from 'csstype';
import { WithStyles, Theme } from "@material-ui/core";
import Button, { ButtonProps } from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import { observer } from 'mobx-react';

import { withStylesDeco } from '../../helpers/util';
import { MyButtonModel } from './model';

const styles = (theme: Theme) => ({
    wrapper: {
        margin: theme.spacing.unit,
        position: 'relative' as PositionProperty,
        width: '100%'
    },
    buttonProgress: {
        position: 'absolute' as PositionProperty,
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
});

type Props = {
    model?: MyButtonModel;
} & ButtonProps;

type InnerProps = Props & WithStyles<typeof styles> & {

};

@withStylesDeco(styles)
@observer
export default class MyButton extends React.Component<Props> {
    private get innerProps() {
        return this.props as InnerProps;
    }
    private model: MyButtonModel;
    constructor(props) {
        super(props);
        this.model = this.props.model || new MyButtonModel();
    }
    render() {
        const { classes, ...restProps } = this.innerProps;
        const { model } = this;
        let child: any;
        if (this.props && this.props.children) {
            child = this.props.children;
        }
        let loading: any;
        if (model.countDown) {
            child = model.countDown + ' s';
        } else if (model.loading) {
            loading = <CircularProgress size={24} className={classes.buttonProgress} />;
        }
        return (
            <div className={classes.wrapper}>
                <Button variant="contained" color="primary" disabled={model.loading || !!model.countDown} {...restProps} children={child} />
                {loading}
            </div>
        );
    }
}