import * as React from 'react';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import { observer, inject } from 'mobx-react';
import { Test } from '../model';
import { withRouterDeco } from '../../../helpers/util';

interface MainSectionProps {
};

type InnerProps = MainSectionProps & RouteComponentProps<any> & {
    test: Test
};

@withRouterDeco
@inject('test')
@observer
export default class MainSection extends React.Component<MainSectionProps> {
    private get innerProps() {
        return this.props as InnerProps;
    }
    constructor(props) {
        super(props);
    }
    public render() {
        const { history, test } = this.innerProps;
        return (
            <div>
                <h4 onClick={() => { test.setText(test.input) }}> Hello {test.text} </h4>
                <Button onClick={test.addCount}>click me({test.count})</Button>
                <Button onClick={() => { history.goBack() }}>back</Button>
                <Input onChange={(e) => { test.input = e.target.value; }} defaultValue={test.input} />
                <NavLink to="/test2">Test2</NavLink>
            </div>
        )
    }
}