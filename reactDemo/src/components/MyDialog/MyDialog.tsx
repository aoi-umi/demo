import * as React from "react";

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Grid from "@material-ui/core/Grid";

import { observer } from 'mobx-react';

import lang from '../../lang';
import { MyDialogModel } from "./model";

export type MyDialogButtonType = {
    text: string;
    type?: string;
    noClose?: boolean;
}
export type MyDialogType = 'alert' | 'confirm' | 'loading';
type MyDialogProps = {
    title?: string;
    type?: MyDialogType;
    children: React.ReactNode;
    noClose?: boolean;
    onClose?: (event, data: MyDialogButtonType, model?: MyDialogModel) => void;
    btnList?: MyDialogButtonType[];
};

@observer
export default class MyDialog extends React.Component<MyDialogProps> {
    private model = new MyDialogModel();
    private btnList: MyDialogButtonType[];
    private noClose: boolean;
    constructor(props) {
        super(props);
        let type = this.props.type || 'alert';
        this.btnList = this.props.btnList || {
            loading: [],
            alert: [{ text: lang.MyDialog.accept, type: 'accept' }],
            confirm: [{ text: lang.MyDialog.cancel, type: 'cancel' }, { text: lang.MyDialog.accept, type: 'accept' }]
        }[type];
        this.noClose = type == 'loading' ? true : this.props.noClose;
    }
    close() {
        this.handleClose(null);
    }
    private handleClose = (event, data?: MyDialogButtonType) => {
        this.props.onClose && this.props.onClose(event, data, this.model);
    }
    render() {
        let { noClose } = this;
        return (
            <Dialog
                open={true}
                scroll={'paper'}
                aria-labelledby="scroll-dialog-title"
                fullWidth={true}
                disableBackdropClick={true}
                disableEscapeKeyDown={true}
            >
                <DialogTitle id="scroll-dialog-title">
                    <Grid container >
                        <Grid item xs>{this.props.title || lang.MyDialog.title}</Grid>
                        <Grid item>
                            {
                                noClose ? null :
                                    <IconButton style={{ padding: 0 }} onClick={this.handleClose}>
                                        <CloseIcon />
                                    </IconButton>
                            }
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    {this.props.children}
                </DialogContent>
                <DialogActions>
                    {this.btnList.map((ele, idx) => {
                        return (
                            <Button key={idx} onClick={(event) => {
                                this.handleClose(event, ele);
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