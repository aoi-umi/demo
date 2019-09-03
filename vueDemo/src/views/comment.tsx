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
import { UserPoptipView } from './comps/user-poptip';

@Component
class Comment extends Base {
    @Prop()
    ownerId: string;

    @Prop()
    ownUserId: string;

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
    submit() {
        let reply = this.reply.content.trim();
        if (!reply)
            return this.$Message.warning('请输入评论');
        this.operateHandler('发送评论', async () => {
            this.submitLoading = true;
            let quote = this.reply.quote || {};
            let topId = quote.topId || quote._id || null;
            let rs = await testApi.commentSubmit({
                ownerId: this.ownerId, comment: reply, type: this.type,
                quoteId: quote._id || null,
                topId,
            });
            let data = this.$refs.list.result.data;
            if (!topId)
                data.unshift(rs);
            else {
                let top = data.find(ele => ele._id === topId);
                if (top)
                    top.replyList.push(rs);
            }
            this.resetReply();
        }).finally(() => {
            this.submitLoading = false;
        });
    }

    delShow = false;
    delList = [];
    handleDel(ele) {
        this.delList = [ele];
        this.delShow = true;
    }

    delClick() {
        return this.operateHandler('删除', async () => {
            await testApi.commentDel({ idList: this.delList.map(ele => ele._id) });
            this.delList.forEach(ele => {
                ele.isDel = true;
            });
            this.delList = [];
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

    private reply = {
        floor: -1,
        quote: null,
        content: ''
    };

    private resetReply(comment?) {
        this.reply.content = '';
        this.reply.floor = comment ? comment.floor : -1;
        this.reply.quote = comment || null;
    }
    renderSubmitBox() {
        return (
            <div style={{ marginTop: '10px' }}>
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
                    v-model={this.reply.content}
                />
                <div style={{ textAlign: 'right', marginTop: '5px' }}>
                    <Button on-click={() => {
                        this.resetReply();
                    }} >取消</Button>
                    <Button type="primary" on-click={() => {
                        this.submit();
                    }} loading={this.submitLoading}>发送评论</Button>
                </div>
            </div>
        );
    }

    renderComment(ele, reply?: boolean) {
        let tab = '42px';
        let rootStyle: any = {
            marginTop: '5px',
        };
        let textStyle = {
            marginBottom: '10px',
        };
        let contentStyle: any = {
            marginLeft: tab,
        };
        if (ele.replyList && ele.replyList.length)
            contentStyle.marginBottom = '10px';
        let dividerStyle: any = {};
        if (reply) {
            rootStyle = {
                marginLeft: tab,
                background: '#eef1f3',
                padding: '24px 0 0 5px',
            };
            dividerStyle = {
                marginBottom: 0,
            };
        }
        return (
            <div style={rootStyle}>
                <div style={{ position: 'relative' }}>
                    {ele.user && <UserAvatarView user={ele.user} isAuthor={ele.user._id === this.ownUserId} />}
                    <span style={{ position: 'absolute', right: '5px' }}>
                        #{ele.floor}
                    </span>
                    <div style={contentStyle}>
                        {ele.quoteUser &&
                            <div><span>回复</span>
                                <UserPoptipView user={ele.quoteUser}>
                                    <b><a>{ele.quoteUser.nickname}</a></b>
                                </UserPoptipView>
                                <b>{ele.quoteUser._id === this.ownUserId && '(作者)'}:</b>
                            </div>
                        }
                        {ele.isDel ?
                            <p style={textStyle}>评论已删除</p> : <p domPropsInnerHTML={ele.comment} style={{ ...textStyle, overflowWrap: 'break-word' }} />
                        }
                        <div style={{ display: 'flex', justifyContent: 'flex-start', cursor: 'pointer', marginRight: '5px' }}>
                            <span class="not-important" ><Time time={new Date(ele.createdAt)} /></span>
                            <div class='flex-stretch'></div>
                            {ele.canDel && <Icon style={{ marginRight: '20px' }} type="md-trash" size={20} on-click={() => {
                                this.handleDel(ele);
                            }} />}
                            <span style={{ marginRight: '20px' }}><Icon type="md-thumbs-up" size={20} color={ele.voteValue == myEnum.voteValue.喜欢 ? "red" : ''} on-click={() => {
                                this.handleVote(ele, ele.voteValue == myEnum.voteValue.喜欢 ? myEnum.voteValue.无 : myEnum.voteValue.喜欢);
                            }} />{ele.like}</span>
                            <Icon type="md-quote" size={20} on-click={() => {
                                this.resetReply(ele);
                            }} />
                        </div>
                    </div>
                    {this.reply.floor === ele.floor && this.renderSubmitBox()}
                </div>
                {!!ele.replyList && ele.replyList.map(reply => this.renderComment(reply, true))}
                <Divider style={dividerStyle} size='small' />
            </div>
        );
    }

    render() {
        return (
            <div>
                <div style={{ textAlign: 'right', marginTop: '5px', marginBottom: '10px' }}>
                    <Button on-click={() => {
                        this.query();
                    }} loading={this.refreshLoading}>刷新评论</Button>
                    <Button type="primary" on-click={() => {
                        this.resetReply({ floor: 0 });
                    }}>发送评论</Button>
                    {this.reply.floor === 0 && this.renderSubmitBox()}
                </div>
                <MyList
                    ref="list"
                    hideSearchBox
                    type="custom"

                    customRenderFn={(rs) => {
                        if (!rs.success || !rs.data.length) {
                            let msg = !rs.success ? rs.msg : '暂无评论';
                            return (
                                <div class="center" style={{ marginTop: '5px', minHeight: '50px' }}>{msg}</div>
                            );
                        }
                        return rs.data.map((ele) => {
                            return this.renderComment(ele);
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