import { ListBase, DelBase } from "./base";
import { IsArray } from "class-validator";

export class BookmarkQuery extends ListBase {
    name: string;
    url: string;
    anyKey: string;
}

export class BookmarkSave {
    _id?: string;
    name?: string;
    url?: string;

    @IsArray()
    addTagList?: string[];

    @IsArray()
    delTagList?: string[];
}

export class BookmarkDel extends DelBase {
}