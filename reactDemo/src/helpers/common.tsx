import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as Q from 'q';
import { MySnackbar, MyDialog } from '../components';
import { MyDialogButtonType } from '../components/MyDialog';
import { extend } from './util';
type MsgNoticeOptions = {
    type?: 'snackbar' | 'dialog',
    dialogBtnList?: MyDialogButtonType[]
}
export async function msgNotice(msg: React.ReactNode, options?: MsgNoticeOptions) {
    let defer = Q.defer();
    try {
        options = extend({
            type: 'snackbar'
        }, options);
        let body = document.body;
        let showDom = document.createElement("div");
        body.appendChild(showDom);
        let dom: any;

        if (options.type === 'snackbar') {
            let close = (event) => {
                //关闭动画结束后销毁
                setTimeout(() => {
                    ReactDom.unmountComponentAtNode(showDom);
                    body.removeChild(showDom);
                    defer.resolve();
                }, 2000);
            }
            dom =
                <MySnackbar variant="warning"
                    message={msg} onClose={close}>
                </MySnackbar>;
        } else {
            let close = (event, type) => {
                ReactDom.unmountComponentAtNode(showDom);
                body.removeChild(showDom);
                defer.resolve(type);
            }
            dom =
                <MyDialog onClose={close} btnList={options.dialogBtnList}>
                    {msg}
                </MyDialog>;
        }

        ReactDom.render(dom, showDom);
    } catch (e) {
        defer.reject(e);
    }
    return defer.promise;
}