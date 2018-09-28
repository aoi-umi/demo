import * as React from 'react';
export class NotMatch extends React.Component {
    public render() {
        return (
            <div>
                404
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
