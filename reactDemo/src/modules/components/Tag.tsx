import * as React from 'react';

import Chip from '@material-ui/core/Chip';

import AddIcon from '@material-ui/icons/Add';
import { lightBlue, blue } from '@material-ui/core/colors'
import { observable, action } from 'mobx';
export type TagType = {
    label: string,
    status: number,/*0原有, 1 新增, -1 删除,*/
    origStatus: number,
    id?: string,
    value?: any,
    disabled?: boolean;
};

export class TagModel {

    @observable
    tagList: TagType[];

    constructor(tagList?: Partial<TagType>[]) {
        this.tagList = [];
        this.setTagList(tagList);
    }

    getChangeTag(key?: string) {
        type returnType = TagType | any;
        let addTagList: returnType[] = [], delTagList: returnType[] = [];
        this.tagList.map(ele => {
            if (1 == ele.status) {
                addTagList.push(key ? ele[key] : ele);
            } else if (0 == ele.origStatus && -1 == ele.status) {
                addTagList.push(key ? ele[key] : ele);
            }
        });
        return {
            addTagList,
            delTagList,
        }
    }

    @action
    setTagList(tagList: Partial<TagType>[]) {
        this.tagList.splice(0, this.tagList.length);
        if (tagList) {
            tagList.forEach((ele: any) => {
                TagModel.initTag(ele);
                if (!ele.id)
                    ele.id = ele.label;
                this.tagList.push(ele);
            });
        }
    }

    @action
    changeTag(val, idx?: number) {
        if (idx === undefined || idx < 0)
            this.tagList.push(val);
        else
            this.tagList[idx] = val;
    }

    delTag = (idx: number) => {
        let tag = this.tagList[idx];
        this.changeTag({
            ...tag,
            status: -1,
        }, idx);
    }

    addTag = (idx?: number, tag?: string | { label: string; id: string, value?: any }) => {
        let showTag: TagType;
        let tagList = this.tagList;
        idx = parseInt(idx as any);
        if (!isNaN(idx)) {
            showTag = tagList[idx];
        } else {
            let tagLabel = '', id = '';
            if (typeof tag == 'string') {
                tagLabel = id = tag;
            } else {
                tagLabel = tag.label;
                id = tag.id;
            }
            id = id && id.trim();
            tagLabel = tagLabel && tagLabel.trim();
            if (id) {
                idx = tagList.findIndex(ele => ele.id == id);
                if (idx >= 0) {
                    showTag = tagList[idx];
                } else {
                    showTag = {
                        label: tagLabel,
                        id,
                        status: 1,
                        origStatus: 1,
                    };
                }
            }
        }
        if (showTag) {
            this.changeTag({
                ...showTag,
                status: showTag.origStatus
            }, idx);
        }
    }

    render(tag: Partial<TagType>, idx?: number, onOperate?: (() => any) | 'default') {
        return TagModel.render(tag, idx,
            onOperate == 'default' ?
                () => {
                    if (tag.status == -1) {
                        this.addTag(idx);
                    } else {
                        this.delTag(idx);
                    }
                } :
                onOperate
        );
    }

    static defaultVal = {
        status: 0,
        origStatus: 0,
    };
    static initTag(ele) {
        let { defaultVal } = TagModel;
        for (let key in defaultVal) {
            if (!ele.hasOwnProperty(key))
                ele[key] = defaultVal[key];
        }
    }
    static render(tag: Partial<TagType> | string, key?: any, onOperate?: () => any) {
        let ele = tag as TagType;
        let noOperate = false;
        let { defaultVal } = TagModel;
        if (typeof ele === 'string') {
            noOperate = true;
            ele = {
                label: ele,
                ...defaultVal,
            };
        } else {
            TagModel.initTag(ele);
        }
        let del = ele.status == -1;
        let add = ele.status == 1;
        let color, operateIcon;
        if (!noOperate) {
            if (del) {
                color = 'secondary';
                operateIcon = <AddIcon />;
            } else if (add) {
                color = 'primary';
            }
        }
        let style: any = {};
        if (!ele.disabled && !color)
            style.backgroundColor = blue[300];
        return (
            <Chip key={key}
                label={ele.label}
                onDelete={onOperate}
                deleteIcon={operateIcon}
                color={color}
                style={{
                    marginRight: 5,
                    marginBottom: 5,
                    ...style,
                }}
            />
        );
    }
}