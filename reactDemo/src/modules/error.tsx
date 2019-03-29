import * as React from 'react';
import Typography from '@material-ui/core/Typography';
export class NotMatch extends React.Component {
    public render() {
        return (
            <div style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                <Typography variant="h1">404</Typography>
            </div>
        );
    }
}

export class ErrorHandler extends React.Component {
    state = {
        hasError: false,
        info: ''
    }

    componentDidCatch(error, info) {
        this.setState({ hasError: true, info });
    }
    render() {
        if (this.state.hasError) {
            console.log(this.state.info);
        }
        return this.props.children;
    }
}
