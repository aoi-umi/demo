import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import moment from 'moment';

import { testApi } from '@/api';
import { convClass, convert } from '@/helpers';
import { MyList, IMyList } from '@/components/my-list';
import { MyEditor } from '@/components/my-editor';
import { Divider, Button, Avatar, Modal, Icon, Time } from '@/components/iview';
import { MyConfirm } from '@/components/my-confirm';
import { dev, myEnum } from '@/config';
import { Base } from './base';
import { UserAvatarView } from './comps/user-avatar';

@Component
class Comment extends Base {
    @Prop()
    ownerId: string;

    @Prop()
    type: number;

    $refs: { list: IMyList<any> };
    mounted() {
        this.query();
    }

    async query(opt?) {
        this.refreshLoading = true;
        await this.$refs.list.query(opt);
        this.refreshLoading = false;
    }

    refreshLoading = false;
    submitLoading = false;
    comment = '';
    submit() {
        let comment = this.comment.trim();
        if (!comment)
            return this.$Message.warning('请输入评论');
        this.operateHandler('发送评论', async () => {
            this.submitLoading = true;
            let rs = await testApi.commentSubmit({ ownerId: this.ownerId, comment: this.comment, type: this.type });
            this.$refs.list.result.data.unshift(rs);
            this.comment = '';
        }).finally(() => {
            this.submitLoading = false;
        });
    }

    delShow = false;
    delIds = [];
    handleDel(id) {
        this.delIds = [id];
        this.delShow = true;
    }

    delClick() {
        return this.operateHandler('删除', async () => {
            await testApi.commentDel({ idList: this.delIds });
            this.$refs.list.result.data = this.$refs.list.result.data.filter(ele => !this.delIds.includes(ele._id));
            this.delShow = false;
        });
    }

    handleVote(detail, value) {
        this.operateHandler('', async () => {
            let rs = await testApi.voteSubmit({ ownerId: detail._id, value, type: myEnum.voteType.评论 });
            for (let key in rs) {
                detail[key] = rs[key];
            }
            detail.voteValue = value;
        }, {
                noSuccessHandler: true
            });
    }

    render() {
        return (
            <div>
                <MyEditor
                    class="comment-send"
                    toolbar={
                        [
                            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                            [{ 'font': [] }],
                            ['link']
                        ]
                    }
                    placeholder='请输入评论'
                    v-model={this.comment}
                />
                <div style={{ textAlign: 'right', marginTop: '5px' }}>
                    <Button on-click={() => {
                        this.query();
                    }} loading={this.refreshLoading}>刷新评论</Button>
                    <Button type="primary" on-click={() => {
                        this.submit();
                    }} loading={this.submitLoading}>发送评论</Button>
                </div>
                <Divider size='small' />
                <MyList
                    ref="list"
                    hideSearchBox
                    type="custom"

                    customRenderFn={(rs) => {
                        if (!rs.success || !rs.data.length) {
                            let msg = !rs.success ? rs.msg : '暂无评论';
                            return (
                                <div style={{ marginTop: '5px', textAlign: 'center' }}>{msg}</div>
                            );
                        }
                        return rs.data.map((ele) => {
                            return (
                                <div>
                                    {ele.isDel ?
                                        <div>
                                            <span style={{ position: 'absolute', right: '5px' }}>
                                                #{ele.floor}
                                            </span>
                                            <p style={{ marginLeft: '42px' }}>
                                                评论已删除
                                            </p>
                                        </div> :
                                        <div style={{ position: 'relative' }}>
                                            <UserAvatarView user={ele.user} tipsPlacement="bottom-start" />
                                            <span style={{ position: 'absolute', right: '5px' }}>
                                                #{ele.floor}
                                            </span>
                                            <div style={{ marginLeft: '42px' }}>
                                                <p domPropsInnerHTML={ele.comment} style={{ overflowWrap: 'break-word', marginBottom: '10px' }} />
                                                <div style={{ position: 'absolute', right: '5px', cursor: 'pointer' }}>
                                                    {ele.canDel && <Icon type="md-trash" size={24} on-click={() => {
                                                        this.handleDel(ele._id);
                                                    }} />}
                                                    <Icon type="md-thumbs-up" size={24} color={ele.voteValue == myEnum.voteValue.喜欢 ? "red" : ''} on-click={() => {
                                                        this.handleVote(ele, ele.voteValue == myEnum.voteValue.喜欢 ? myEnum.voteValue.无 : myEnum.voteValue.喜欢);
                                                    }} />{ele.like}
                                                </div>
                                                <span class="not-important"><Time time={new Date(ele.createdAt)} /></span>
                                            </div>
                                        </div>
                                    }
                                    <Divider size='small' />
                                </div>
                            );
                        });
                    }}

                    on-query={(t) => {
                        this.query(convert.Test.listModelToQuery(t));
                    }}

                    queryFn={async (data) => {
                        let rs = await testApi.commentQuery({
                            ...data,
                            ownerId: this.ownerId,
                            type: this.type,
                        });
                        return rs;
                    }}
                ></MyList>
                <Modal v-model={this.delShow} footer-hide>
                    <MyConfirm title='确认删除?' loading={true}
                        cancel={() => {
                            this.delShow = false;
                        }}
                        ok={async () => {
                            await this.delClick();
                        }}>
                        确认删除?
                    </MyConfirm>
                </Modal>
            </div>
        );
    }
}

export const CommentView = convClass<Comment>(Comment);