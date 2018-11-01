import * as React from 'react';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Button from '@material-ui/core/Button';

import { withRouterDeco } from '../../helpers/util';
import * as common from '../../helpers/common';
import { MyList } from '../../components';
import { BookmarkQueryModel } from './model';
import { testApi } from '../api';
import { ListModel } from '../../components/MyList';


type InnerProps = RouteComponentProps<{ p1: string, p2: string }>;

@withRouterDeco
export default class Bookmark extends React.Component {
    private input: React.RefObject<HTMLInputElement>;
    private get innerProps() {
        return this.props as InnerProps;
    }
    private queryModel = new BookmarkQueryModel();
    constructor(props, context) {
        super(props, context);
        this.input = React.createRef();
    }

    public render() {
        const { history, match } = this.innerProps;
        const { queryModel } = this;
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
                    queryModel={queryModel}
                    onQueryClick={async (model: ListModel<BookmarkQueryModel>) => {
                        let query = model.query;
                        let page = model.page;
                        let data = await testApi.bookmarkQuery({
                            name: query.name,
                            url: query.url,
                            anyKey: query.anyKey,
                            pageIndex: page.pageIndex + 1,
                            pageSize: page.pageSize,
                        });
                        return data;
                    }}
                    header={
                        <TableRow>
                            <TableCell>名字</TableCell>
                            <TableCell>url</TableCell>
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
                            </TableRow>
                        );
                    }}
                >
                </MyList>
            </div>
        )
    }
}