import * as React from 'react';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Paper from '@material-ui/core/Paper';
import MenuList from '@material-ui/core/MenuList';
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import { observer, inject } from 'mobx-react';
import * as anime from 'animejs';
import { runInAction, observable } from 'mobx';

import { Test } from './model';
import { withRouterDeco } from '../../helpers/util';
import { msgNotice } from '../../helpers/common';
import { MyTextField, MySelect } from '../../components';

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
    contents: {
        idx: number,
        msg: string,
        animeInst?: anime.AnimeInstance,
        finished?: boolean,
        dom?: HTMLElement,
    }[] = [];
    board: HTMLElement;

    @observable
    danmaku = '';

    @observable
    poperOpen = false;
    poperAnchorEl;

    @observable
    menuOpen = false;
    menuAnchorEl;

    private get innerProps() {
        return this.props as InnerProps;
    }
    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
        let width = this.board.offsetWidth;
        let height = this.board.offsetHeight;
        let v = 1;
        let transXReg = /\.*translateX\((.*)px\)/i;
        let { contents } = this;
        contents.forEach((ele, idx) => {
            let dom = ele.dom;
            if (dom && !ele.animeInst) {
                let topLevelDict = { 0: 0 };
                contents.forEach((cont, idx2) => {
                    let d = cont.dom;
                    if (idx != idx2 && d) {
                        let x = Math.abs(parseFloat(transXReg.exec(d.style.transform)[1]));
                        if (!isNaN(x) && x < d.offsetWidth) {
                            let top = d.offsetTop;
                            if (!topLevelDict[top])
                                topLevelDict[top] = 0;
                            topLevelDict[top]++;
                            let newTop = d.offsetHeight + d.offsetTop;
                            if (newTop + dom.offsetHeight >= height)
                                newTop = 0;
                            if (!topLevelDict[newTop])
                                topLevelDict[newTop] = 0;
                        }
                    }
                });
                let s = width + dom.offsetWidth;
                let top = 0;
                let minLevel = -1;
                // console.log(topLevelDict);
                for (let key in topLevelDict) {
                    let level = topLevelDict[key];
                    if (minLevel < 0 || level < minLevel) {
                        minLevel = level;
                        top = parseFloat(key);
                    }
                }
                if (top)
                    dom.style.top = top + 'px';
                let duration = s * 10 / v;
                ele.animeInst = anime({
                    targets: dom,
                    translateX: -s,
                    duration,
                    easing: 'linear'
                });
                ele.animeInst.finished.then(() => {
                    let content = contents[idx];
                    if (content)
                        content.finished = true;
                });
            }
        });
        //移除已结束
        // for (let idx = contents.length - 1; idx >= 0; idx--) {
        //     let ele = contents[idx];
        //     if (ele.finished)
        //         contents.splice(idx, 1);
        // }
    }
    public render() {
        const { history, test } = this.innerProps;
        let { contents } = this;
        let list = [];
        for (let i = 0; i <= 10; i++) {
            list.push({ label: 'label' + i, value: 'value' + i })
        }
        //marquee
        return (
            <div>
                <div>
                    <Input onChange={(e) => { test.text = e.target.value; }} defaultValue={test.text} />
                    <h4> Hello {test.getText()} </h4>
                    <Button onClick={test.addCount}>click me({test.count})</Button>
                    <Button onClick={() => { history.goBack() }}>back</Button>
                </div>
                <div>
                    <Button onClick={() => {
                        msgNotice('测试');
                    }}>msg notice</Button>
                    <Button onClick={() => {
                        msgNotice('测试', { type: 'dialog', dialogBtnList: [{ text: '确认', type: 'accept' }] }).waitClose().then(t => {
                            console.log(t);
                        });
                    }}>msg notice</Button>
                </div>
                <div>
                    <MySelect options={list}></MySelect>
                    <TextField select fullWidth value=''>
                        {list.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </div>
                <div>
                    <Button buttonRef={node => {
                        this.poperAnchorEl = node;
                    }} onClick={() => { this.poperOpen = !this.poperOpen; }}>popper</Button>
                    <Popper open={this.poperOpen} anchorEl={this.poperAnchorEl} style={{ zIndex: 1 }}>
                        <Paper>
                            <ClickAwayListener onClickAway={() => { this.poperOpen = false; }}>
                                <MenuList>
                                    {list.map(option => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Popper>
                    <Button buttonRef={node => {
                        this.menuAnchorEl = node;
                    }} onClick={() => { this.menuOpen = !this.menuOpen }}>menu</Button>
                    <Menu open={this.menuOpen} anchorEl={this.menuAnchorEl} onClose={() => { this.menuOpen = false }}>
                        {list.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Menu>
                </div>
                <div>
                    <Input value={this.danmaku} onChange={(e) => { this.danmaku = e.target.value; }} />
                    <Button onClick={() => {
                        if (this.danmaku && this.danmaku.length) {
                            let idx = contents.length;
                            contents.push({ idx, msg: this.danmaku });
                            this.danmaku = '';
                        }
                    }}>danmaku</Button>
                    <Button onClick={() => { this.contents = []; }}>clear anime</Button>
                </div>
                <div ref={(el) => { this.board = el; }} style={{ height: 500, width: 500, background: '#f7f7f7', overflow: 'hidden', position: 'absolute' }}>
                    {
                        contents.map(ele => {
                            let idx = ele.idx;
                            return (
                                <div key={idx} ref={(el) => {
                                    if (contents.length > idx) {
                                        let match = contents[idx];
                                        if (match)
                                            match.dom = el;
                                    }
                                }} style={{ display: 'inline-block', position: 'absolute', left: '100%', whiteSpace: 'nowrap' }}>
                                    {ele.msg}
                                </div>);
                        })
                    }
                </div>
            </div >
        )
    }
}