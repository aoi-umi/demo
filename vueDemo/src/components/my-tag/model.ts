import { myTag } from './my-tag';

export type TagType = {
    add: boolean;
    tag: string;
    selected: boolean;
};
export class MyTagModel {
    tagList: TagType[];

    constructor(tagList: string[]) {
        if (tagList && tagList.length) {
            this.tagList = tagList.map(ele => {
                return {
                    add: false,
                    tag: ele,
                    selected: true,
                }
            });
        } else {
            this.tagList = [];
        }
    }

    findTag(tag: string) {
        return this.tagList.find(ele => ele.tag === tag);
    }

    addTag(tag: string) {
        let match = this.findTag(tag);
        if (!match) {
            this.tagList.push({
                add: true,
                tag,
                selected: true,
            });
        } else {
            match.selected = true;
        }
    }

    delTag(tag: string) {
        let match = this.findTag(tag);
        if (match) {
            match.selected = false;
        }
    }

    renderTag() {
        return myTag.renderTag(this.tagList);
    }
}