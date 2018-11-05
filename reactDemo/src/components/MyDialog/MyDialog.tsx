import * as React from "react";

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import { observer } from 'mobx-react';

import { MyDialogModel } from "./model";

export type MyDialogButtonType = {
    text: string;
    type?: string;
}
export type MyDialogType = 'alert' | 'confirm' | 'loading';
type MyDialogProps = {
    title?: string;
    type?: MyDialogType;
    children: React.ReactNode;
    onClose?: (event, type) => void,
    btnList?: MyDialogButtonType[]
};

@observer
export default class MyDialog extends React.Component<MyDialogProps> {
    private model = new MyDialogModel();
    private btnList: MyDialogButtonType[];
    constructor(props) {
        super(props);
        let type = this.props.type || 'alert';
        this.btnList = this.props.btnList || {
            loading: [],
            alert: [{ text: '确认', type: 'accept' }],
            confirm: [{ text: '取消', type: 'cancel' }, { text: '确认', type: 'accept' }]
        }[type];

    }
    close() {
        this.handleClose(null);
    }
    private handleClose = (event, type?: string) => {
        this.model.toggle(false);
        this.props.onClose && this.props.onClose(event, type);
    }
    render() {
        return (
            <Dialog
                open={this.model.open}
                onClose={this.handleClose}
                scroll={'paper'}
                aria-labelledby="scroll-dialog-title"
                fullWidth={true}
                disableBackdropClick={true}
                disableEscapeKeyDown={true}
            >
                <DialogTitle id="scroll-dialog-title">{this.props.title || '提示'}</DialogTitle>
                <DialogContent>
                    {this.props.children}
                </DialogContent>
                <DialogActions>
                    {this.btnList.map((ele, idx) => {
                        return (
                            <Button key={idx} onClick={(event) => {
                                this.handleClose(event, ele.type);
                            }} color="primary">
                                {ele.text}
                            </Button>
                        );
                    })}
                </DialogActions>
            </Dialog>
        );
    }
}