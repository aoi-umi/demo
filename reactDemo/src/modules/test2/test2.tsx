import * as React from 'react';
import { NavLink } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import { ajax, withRouterDeco } from '../../helpers/util';
import * as common from '../../helpers/common';

export default class Test2 extends React.Component {
    private input: React.RefObject<HTMLInputElement>;
    constructor(props) {
        super(props);
        this.input = React.createRef();

    }
    async click() {
        try {
            let result = await ajax({ url: this.input.current.value, method: 'GET' });
            console.log(result);
        } catch (e) {
            common.msgNotice(e.message);
        }
    }
    public render() {
        return (
            <div>
                <h3>Test2</h3>
                <NavLink to="/">BackToIndex</NavLink>
                <div>
                    <Input inputRef={this.input} defaultValue="/"></Input>
                    <Button onClick={this.click.bind(this)}>点我</Button>
                </div>
            </div>
        )
    }
}