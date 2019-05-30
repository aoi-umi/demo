import { Vue } from 'vue-property-decorator';
import { MyTag, RenderTagType } from './my-tag';
const myTag = new MyTag();
export type TagType = {
    add?: boolean;
    key?: string;
    tag?: string;
    selected?: boolean;
    color?: string;
    checkable?: boolean;
    data?: any;
};

type TagObjType = {
    key: string;
    tag: string;
    data?: any;
};
type OutTagType = TagObjType | string;
export class MyTagModel {
    tagList: TagType[] = [];

    constructor(tagList: OutTagType[]) {
        if (tagList && tagList.length) {
            this.tagList = tagList.map(ele => {
                let { key, tag, data } = this.getTag(ele);
                return {
                    add: false,
                    key,
                    tag,
                    selected: true,
                    checkable: true,
                    data,
                }
            });
        } else {
            this.tagList = [];
        }
    }

    private getTag(ele: OutTagType) {
        let key = '', tag = '', data;
        if (typeof ele === 'string')
            data = key = tag = ele;
        else {
            key = ele.key;
            tag = ele.tag;
            data = ele.data;
        }
        return {
            key,
            tag,
            data,
        };
    }

    findTag(key: string) {
        return this.tagList.find(ele => ele.key === key);
    }

    addTag(oTag: OutTagType) {
        let { key, tag, data } = this.getTag(oTag);
        let match = this.findTag(key);
        if (!match) {
            this.tagList.push({
                add: true,
                tag,
                key,
                selected: true,
                checkable: true,
                data,
            });
        } else {
            match.selected = true;
        }
    }

    delTag(oTag: OutTagType) {
        let { key, tag } = this.getTag(oTag);
        let match = this.findTag(key);
        if (match) {
            match.selected = false;
        }
    }

    renderTag() {
        return myTag.renderTag(this.tagList);
    }

    static renderTag(tagList: RenderTagType | (RenderTagType[])) {
        return myTag.renderTag(tagList);
    }

    getChangeTag(key?: string) {
        type returnType = TagType | any;
        let addTagList: returnType[] = [], delTagList: returnType[] = [];
        this.tagList.map(ele => {
            if (ele.add && ele.selected) {
                addTagList.push(key ? ele[key] : ele);
            } else if (!ele.add && !ele.selected) {
                delTagList.push(key ? ele[key] : ele);
            }
        });
        return {
            addTagList,
            delTagList,
        }
    }
}