import * as React from 'react';
import * as ReactDom from 'react-dom';
import MySnackbar from '../modules/MySnackbar';
export function msgNotice(msg: string, options?) {
    let body = document.body;
    let showDom = document.createElement("div");
    body.appendChild(showDom);
    //删除       
    let close = () => {
        //关闭动画结束后销毁
        setTimeout(() => {
            ReactDom.unmountComponentAtNode(showDom);
            body.removeChild(showDom);
        }, 2000);
    }
    ReactDom.render((
        <MySnackbar variant="warning"
            message={msg} onClose={close}>
        </MySnackbar>
    ), showDom);
}