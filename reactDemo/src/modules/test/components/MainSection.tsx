import * as React from 'react';
import { NavLink } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import { Test } from '../model';

interface MainSectionProps {
    test: Test;
    btnClick: () => void;
    textClick: (newText?: string) => void;
};

export default class MainSection extends React.Component<MainSectionProps> {
    private input: React.RefObject<HTMLInputElement>;
    constructor(props) {
        super(props);
        this.input = React.createRef();
    }
    public render() {
        const { test, textClick, btnClick } = this.props;
        return (
            <div>
                <h4 onClick={() => { textClick(this.input.current.value) }}> Hello {test.text} </h4>
                <Button onClick={btnClick}>click me({test.count})</Button>
                <Input inputRef={this.input} />
                <NavLink to="/test2">Test2</NavLink>
            </div>
        )
    }
}