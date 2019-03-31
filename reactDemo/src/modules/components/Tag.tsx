import * as React from 'react';

import Chip from '@material-ui/core/Chip';

import AddIcon from '@material-ui/icons/Add';
export type TagType = {
    tag: string,
    status: number,/*0, 1 新增, -1 删除,*/
    origStatus: number,
};

export class Tag {
    static render(tag: TagType | string, key?: any, onOperate?) {
        let ele = tag as TagType;
        let noOperate = false;
        if (typeof ele === 'string') {
            noOperate = true;
            ele = {
                tag: ele,
                status: 0,
                origStatus: 0
            };
        }
        let del = ele.status == -1;
        let add = ele.status == 1;
        let color, deleteIcon;
        if (!noOperate) {
            if (del) {
                color = 'secondary';
                deleteIcon = <AddIcon />;
            } else if (add) {
                color = 'primary';
            }
        }
        return (
            <Chip key={key}
                label={ele.tag}
                onDelete={onOperate}
                deleteIcon={deleteIcon}
                color={color}
                style={{
                    marginRight: 5,
                    marginBottom: 5
                }}
            />
        );
    }
}