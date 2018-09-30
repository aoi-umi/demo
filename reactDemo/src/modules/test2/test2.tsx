import * as React from 'react';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import { ajax, withRouterDeco } from '../../helpers/util';
import * as common from '../../helpers/common';


type InnerProps = RouteComponentProps<{ p1: string, p2: string }>;

@withRouterDeco
export default class Test2 extends React.Component {
    private input: React.RefObject<HTMLInputElement>;
    private get innerProps() {
        return this.props as InnerProps;
    }
    constructor(props, context) {
        super(props, context);
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
        const { history, match } = this.innerProps;
        return (
            <div>
                <h3>Test2</h3>
                <NavLink to="/">BackToIndex</NavLink>
                <div>
                    <Input inputRef={this.input} defaultValue={match.params.p1 || '/'}></Input>
                    <Button onClick={this.click.bind(this)}>点我</Button>
                    <Button onClick={() => { history.goBack() }}>back</Button>
                </div>
            </div>
        )
    }
}