import * as React from 'react';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Button from '@material-ui/core/Button';

import { withRouterDeco } from '../../helpers/util';
import { MyList } from '../../components';
import { BookmarkQueryModel } from './model';
import { testApi } from '../api';
import { ListModel } from '../../components/MyList';
import { msgNotice } from '../../helpers/common';


type InnerProps = RouteComponentProps<{ p1: string, p2: string }>;

@withRouterDeco
export default class Bookmark extends React.Component {
    private input: React.RefObject<HTMLInputElement>;
    private get innerProps() {
        return this.props as InnerProps;
    }
    private listModel: ListModel<BookmarkQueryModel>;
    constructor(props, context) {
        super(props, context);
        this.input = React.createRef();
        this.listModel = new ListModel(new BookmarkQueryModel());
    }

    private showDetail = () => {
        console.log('这里写新增/修改');
    }

    private onDelClick = async (_id: string) => {
        let obj = msgNotice('确认删除?', { type: 'dialog', dialogType: 'confirm' });
        let type = await obj.waitClose();
        if (type == 'accept') {
            let loading = msgNotice('删除中', { type: 'dialog', dialogType: 'loading' });
            try {
                await testApi.bookmarkDel(_id);
                let closeType = await msgNotice('删除成功', {
                    type: 'dialog', dialogBtnList: [{
                        text: '刷新', type: 'refresh'
                    }, {
                        text: '关闭'
                    }]
                }).waitClose();
                if (closeType == 'refresh') {
                    this.listModel.page.setPage(this.listModel.page.pageIndex);
                }
            } catch (e) {
                msgNotice(`删除失败:${e.message}`, { type: 'dialog', dialogType: 'alert' });
            } finally {
                loading.close();
            }
        }
    }

    public render() {
        const { history, match } = this.innerProps;
        const { listModel } = this;
        return (
            <div>
                <MyList
                    queryRows={[{
                        id: 'name'
                    }, {
                        id: 'url'
                    }, {
                        id: 'anyKey'
                    }]}
                    listModel={listModel}
                    onQueryClick={async (model: ListModel<BookmarkQueryModel>) => {
                        let query = model.query;
                        let page = model.page;
                        let data = await testApi.bookmarkQuery({
                            name: query.name,
                            url: query.url,
                            anyKey: query.anyKey,
                            page: page.pageIndex + 1,
                            rows: page.pageSize,
                        });
                        return data;
                    }}
                    header={
                        <TableRow>
                            <TableCell>名字</TableCell>
                            <TableCell>url</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    }
                    onRowRender={(ele, idx) => {
                        return (
                            <TableRow key={idx}>
                                <TableCell>
                                    <a href={ele.url} title={ele.url} target={'_blank'}>
                                        {ele.name}
                                    </a>
                                </TableCell>
                                <TableCell>
                                    {ele.url}
                                </TableCell>
                                <TableCell>
                                    <Button onClick={() => {
                                        this.showDetail();
                                    }}>修改</Button>
                                    <Button onClick={() => {
                                        this.onDelClick(ele._id);
                                    }}>删除</Button>
                                </TableCell>
                            </TableRow>
                        );
                    }}

                    onAddClick={() => {
                        this.showDetail();
                    }}
                >
                </MyList>
            </div>
        )
    }
}