import * as React from 'react';
import { NavLink } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';

import { createStore } from 'redux';

import { connectDeco, ajax, withRouterDeco } from '../helpers/util';
import * as common from '../helpers/common';
import { Provider } from 'react-redux';

//#region test1
const ActionType = {
    CHANGE_TEXT: 'CHANGE_TEXT',
    BUTTON_CLICK: 'BUTTON_CLICK',
}
const initialState = {
    text: 'Hello',
    count: 0,
}

//映射Redux state到组件的属性
function mapStateToProps(state) {
    return state;
}
interface DispatchResult {
    onButtonClick: (x: number) => any
    onChangeText: (text?: string) => any,
}
//映射Redux actions到组件的属性
function mapDispatchToProps(dispatch): DispatchResult {
    return {
        onButtonClick: (x) => dispatch({ type: ActionType.BUTTON_CLICK, x }),
        onChangeText: (text) => dispatch({ type: ActionType.CHANGE_TEXT, text })
    }
}

@connectDeco(mapStateToProps, mapDispatchToProps)
export class Test1 extends React.Component<Partial<typeof initialState & DispatchResult>> {
    private input: React.RefObject<HTMLInputElement>;
    constructor(props) {
        super(props);
        this.input = React.createRef();

    }
    public render() {
        const { text, onChangeText, onButtonClick, count } = this.props;
        return (
            <div>
                <h4 onClick={() => { onChangeText(this.input.current.value) }}> {text} </h4>
                <Button onClick={() => { onButtonClick(1) }}>click me({count})</Button>
                <Input inputRef={this.input} />
                <NavLink to="/test2">Test2</NavLink>
            </div>
        )
    }
}

const reducer = (state = initialState, action) => {
    let returnVal = {
        ...state,
    }
    switch (action.type) {
        case ActionType.CHANGE_TEXT:
            returnVal = {
                ...returnVal,
                text: 'Hello ' + (action.text || 'world')
            }
            break;
        case ActionType.BUTTON_CLICK:
            returnVal = {
                ...returnVal,
                text: 'Hello world',
                count: state.count + 1,
            }
            break;
    }
    return returnVal;
}

//store
let store = createStore(reducer);

export class Test extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <Test1 />
            </Provider>
        );
    }
}
//#endregion

export class Test2 extends React.Component {
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