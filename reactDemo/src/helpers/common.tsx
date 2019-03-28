import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as Q from 'q';
import {
    MySnackbarVariantType,
    MyDialogButtonType, MyDialogType
} from '../components';
import MySnackbar from '../components/MySnackbar';
import MyDialog from '../components/MyDialog';
import { extend } from './util';
import { withCustomTheme } from '..';
type MsgNoticeOptions = {
    type?: 'snackbar' | 'dialog',
    noClose?: boolean;
    autoHideDuration?: number;

    snackbarVariant?: MySnackbarVariantType;

    dialogTitle?: string;
    dialogType?: MyDialogType;
    dialogBtnList?: MyDialogButtonType[];

}
export function msgNotice(msg: React.ReactNode, options?: MsgNoticeOptions) {
    let defer = Q.defer();
    let dom: any;
    let body = document.body;
    let showDom = document.createElement("div");
    body.appendChild(showDom);
    let close = (event?, data?: MyDialogButtonType) => {
        if (!data || !data.noClose) {
            ReactDom.unmountComponentAtNode(showDom);
            body.removeChild(showDom);
        }
        defer.resolve(data && data.type);
    }
    try {
        options = extend({
            type: 'snackbar'
        }, options);

        if (options.type === 'snackbar') {
            dom =
                <MySnackbar variant={options.snackbarVariant || "warning"}
                    autoHideDuration={options.autoHideDuration}
                    message={msg}
                    noClose={options.noClose}
                    onClose={(event) => {
                        //关闭动画结束后销毁
                        setTimeout(() => {
                            close(event);
                        }, 2000);
                    }}>
                </MySnackbar>;
        } else {
            dom =
                <MyDialog
                    noClose={options.noClose}
                    onClose={close}
                    title={options.dialogTitle}
                    type={options.dialogType}
                    btnList={options.dialogBtnList}>
                    {msg}
                </MyDialog>;
        }
        dom = withCustomTheme(dom);
        ReactDom.render(dom, showDom);
    } catch (e) {
        defer.reject(e);
    }
    return {
        close,
        waitClose: () => defer.promise
    }
}