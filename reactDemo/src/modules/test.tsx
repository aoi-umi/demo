import * as React from 'react';
import { NavLink } from 'react-router-dom';
export class Test extends React.Component {
    public render() {
        return (
            <div>
                <h3>Test</h3>
                <NavLink to="/test2">Test2</NavLink>
            </div>
        )
    }
}
export class Test2 extends React.Component {
    public render() {
        return (
            <div>
                <h3>Test2</h3>
                <NavLink to="/">BackToIndex</NavLink>
            </div>
        )
    }
}