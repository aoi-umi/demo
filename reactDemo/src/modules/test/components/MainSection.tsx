import * as React from 'react';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import { observer, inject } from 'mobx-react';
import * as anime from 'animejs';
import { runInAction, observable } from 'mobx';
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
    @observable
    contents: any[] = [];
    dom: HTMLElement[] = [];
    board: HTMLElement;
    private get innerProps() {
        return this.props as InnerProps;
    }
    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
        let width = this.board.offsetWidth;
        let v = 1;
        let transXReg = /\.*translateX\((.*)px\)/i;
        this.contents.forEach((ele, idx) => {
            let dom = this.dom[idx];
            if (dom && !ele.animeInst) {
                let top = 0;
                this.dom.forEach((d, idx2) => {
                    if (idx != idx2 && d) {
                        let x = Math.abs(parseFloat(transXReg.exec(d.style.transform)[1]));
                        if (!isNaN(x) && x < d.offsetWidth && d.offsetTop >= top) {
                            top = d.offsetHeight + d.offsetTop;
                        }
                    }
                });
                let s = width + dom.offsetWidth;
                if (top)
                    dom.style.top = top + 'px';
                let duration = s * 10 / v;
                ele.animeInst = anime({
                    targets: dom,
                    translateX: -s,
                    duration,
                    easing: 'linear'
                })
            }
        });
    }
    public render() {
        const { history, test } = this.innerProps;
        //marquee
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
                <Button onClick={() => {
                    let idx = this.contents.length;
                    this.contents.push({ idx, msg: `${idx}: 123456` });
                }}>anime</Button>
                <Button onClick={() => { this.contents = []; }}>clear anime</Button>
                <div ref={(el) => { this.board = el; }} style={{ height: 500, width: 500, background: '#f7f7f7', overflow: 'hidden', position: 'absolute' }}>
                    {
                        this.contents.map(ele => {
                            let idx = ele.idx;
                            return (
                                <div key={idx} ref={(el) => {
                                    if (this.contents.length > idx) {
                                        let match = this.contents[idx];
                                        if (match)
                                            this.dom[idx] = el;
                                    }
                                }} style={{ display: 'inline-block', position: 'absolute', left: '100%', whiteSpace: 'nowrap' }}>
                                    {idx}: 1234567890987654321
                                </div>);
                        })
                    }
                </div>
            </div >
        )
    }
}