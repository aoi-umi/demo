import * as React from 'react';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import { observer, inject } from 'mobx-react';
import * as anime from 'animejs';
//@ts-ignore
anime = anime['default'];
import { Test } from '../model';
import { withRouterDeco } from '../../../helpers/util';
import { msgNotice } from '../../../helpers/common';

interface MainSectionProps {
};

type InnerProps = MainSectionProps & RouteComponentProps<any> & {
    test: Test
};

@withRouterDeco
@inject('test')
@observer
export default class MainSection extends React.Component<MainSectionProps> {
    content: any;
    private get innerProps() {
        return this.props as InnerProps;
    }
    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
        anime({
            targets: this.content,
            translateX: 300,
            duration: 1000,
            easing: 'linear'
        })
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
                <Button onClick={() => {
                    msgNotice('测试');
                }}>msg notice</Button>
                <Button onClick={() => {
                    msgNotice('测试', { type: 'dialog', dialogBtnList: [{ text: '确认', type: 'accept' }] }).waitClose().then(t => {
                        console.log(t);
                    });
                }}>msg notice</Button>
                <div style={{ height: 500, width: 500, background: '#0ff', opacity: 0.6 }}>
                    <div ref={el => { this.content = el; }}>12345</div>
                </div>
            </div>
        )
    }
}