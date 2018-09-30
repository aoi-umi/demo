import * as React from 'react';
import { NavLink } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import { observer } from 'mobx-react';
import { Test } from '../model';

interface MainSectionProps {
};

@observer
export default class MainSection extends React.Component<MainSectionProps> {
    private dataSource = new Test();
    private input: React.RefObject<HTMLInputElement>;
    constructor(props) {
        super(props);
        this.input = React.createRef();
        this.dataSource.setText();
    }
    public render() {
        const { } = this.props;
        const { dataSource } = this;
        return (
            <div>
                <h4 onClick={() => { dataSource.setText(this.input.current.value) }}> Hello {dataSource.text} </h4>
                <Button onClick={dataSource.addCount}>click me({dataSource.count})</Button>
                <Input inputRef={this.input} />
                <NavLink to="/test2">Test2</NavLink>
            </div>
        )
    }
}