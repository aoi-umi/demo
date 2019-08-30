
export type TagType = {
    add?: boolean;
    key?: string;
    tag?: string;
    checked?: boolean;
    color?: string;
    checkable?: boolean;
    data?: any;
    isDel?: boolean;
};

type TagObjType = {
    key: string;
    tag: string;
    data?: any;
    isDel?: boolean;
};
type OutTagType = TagObjType | string;
export class MyTagModel {
    tagList: TagType[] = [];

    constructor(tagList?: OutTagType[]) {
        this.initTag(tagList);
    }

    initTag(tagList: OutTagType[]) {
        if (tagList && tagList.length) {
            this.tagList = tagList.map(ele => {
                let newTag = this.getTag(ele);
                return {
                    add: false,
                    key: newTag.key,
                    tag: newTag.tag,
                    selected: true,
                    checkable: true,
                    data: newTag.data,
                    isDel: newTag.isDel
                };
            });
        } else {
            this.tagList = [];
        }
    }

    private getTag(ele: OutTagType) {
        let key = '', tag = '', data, isDel = false;
        if (typeof ele === 'string')
            data = key = tag = ele;
        else {
            key = ele.key;
            tag = ele.tag;
            data = ele.data;
            isDel = ele.isDel;
        }
        return {
            key,
            tag,
            data,
            isDel
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
                checked: true,
                checkable: true,
                data,
            });
        } else {
            match.checked = true;
        }
    }

    delTag(oTag: OutTagType) {
        let { key, tag } = this.getTag(oTag);
        let match = this.findTag(key);
        if (match) {
            match.checked = false;
        }
    }

    getChangeTag(key?: string) {
        type returnType = TagType | any;
        let addTagList: returnType[] = [], delTagList: returnType[] = [];
        this.tagList.map(ele => {
            if (ele.add && ele.checked) {
                addTagList.push(key ? ele[key] : ele);
            } else if (!ele.add && !ele.checked) {
                delTagList.push(key ? ele[key] : ele);
            }
        });
        return {
            addTagList,
            delTagList,
        };
    }
}