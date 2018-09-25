import * as ejs from 'ejs';
import * as common from './common';

export class Tree {
    static renderTree(list: any[], temp: string, opt?: {
        typeKey?: string,
        parentTypeKey?: string,
        treeListId?: string,
        notInRootTreeListId?: string
    }) {
        opt = {
            typeKey: 'type',
            parentTypeKey: 'parentType',
            treeListId: 'treeList',
            notInRootTreeListId: 'notInRootTreeList',
            ...opt,
        }
        $('.tree').empty();
        let tree = common.getTree(list, '', null, opt.typeKey, opt.parentTypeKey);
        let itemTree = tree.itemTree;
        var rootTree = tree.rootTree;

        function renderTree(leave, treeDom) {
            leave.item.inRoot = leave.inRoot;
            var leaveDom = $(ejs.render(temp, leave.item));
            leaveDom.data('item', leave.item);
            treeDom.append(leaveDom);
            if (leave.child) {
                for (var key in leave.child) {
                    renderTree(leave.child[key], leaveDom.find('.child:eq(0)'));
                }
            }
        }

        for (var key in rootTree) {
            renderTree(rootTree[key], $(`#${opt.treeListId}`));
        }
        for (var key in itemTree) {
            var val = itemTree[key];
            if (!val.inRoot) {
                renderTree(val, $(`#${opt.notInRootTreeListId}`));
            }
        }
    }
}