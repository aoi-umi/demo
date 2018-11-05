import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as Q from 'q';
import { MySnackbar, MyDialog } from '../components';
import { MyDialogButtonType, MyDialogType } from '../components/MyDialog';
import { extend } from './util';
type MsgNoticeOptions = {
    type?: 'snackbar' | 'dialog',
    dialogType?: MyDialogType;
    dialogBtnList?: MyDialogButtonType[]
}
export function msgNotice(msg: React.ReactNode, options?: MsgNoticeOptions) {
    let defer = Q.defer();
    let dom: any;
    let body = document.body;
    let showDom = document.createElement("div");
    body.appendChild(showDom);
    let close = (event?, type?) => {
        ReactDom.unmountComponentAtNode(showDom);
        body.removeChild(showDom);
        defer.resolve(type);
    }
    try {
        options = extend({
            type: 'snackbar'
        }, options);

        if (options.type === 'snackbar') {
            dom =
                <MySnackbar variant="warning"
                    message={msg} onClose={(event) => {
                        //关闭动画结束后销毁
                        setTimeout(() => {
                            close(event);
                        }, 2000);
                    }}>
                </MySnackbar>;
        } else {
            dom =
                <MyDialog
                    onClose={close}
                    type={options.dialogType}
                    btnList={options.dialogBtnList}>
                    {msg}
                </MyDialog>;
        }

        ReactDom.render(dom, showDom);
    } catch (e) {
        defer.reject(e);
    }
    return {
        close,
        waitClose: () => defer.promise
    }
}