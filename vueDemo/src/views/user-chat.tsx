import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Card, Split, Input, Button, Time, Icon } from '@/components/iview';
import { IMyLoad, MyLoad } from '@/components/my-load';
import { convClass, randStr } from '@/helpers';
import { testApi } from '@/api';
import { Base } from './base';
import { DetailDataType as UserDetailDataType } from './user-mgt';
import { UserAvatarView } from './comps/user-avatar';
import { myEnum } from '@/config';

@Component
class UserChat extends Base {
    detail: UserDetailDataType = {};
    mounted() {
        this.load();
    }

    @Watch('$route')
    route(to, from) {
        this.load();
    }

    load() {
        let query = this.$route.query as { [key: string]: string };
        this.$refs.loadView.loadData().then(() => {

        });
    }

    async getUserDetail() {
        let query = this.$route.query;
        this.detail = await testApi.userDetailQuery(query._id);
        this.loadChat().then(() => {
            this.$refs.chat.scrollTop = this.$refs.chat.scrollHeight;
        });
        return this.detail;
    }

    private loading = false;
    loadChat() {
        this.loading = true;
        return this.operateHandler('获取私信', async () => {
            let rs = await testApi.chatQuery({
                destUserId: this.detail._id,
                lastId: this.lastId,
                rows: 10,
            });
            this.chat = [
                ...rs.rows,
                ...this.chat
            ];
            if (this.chat.length > 0)
                this.lastId = this.chat[0]._id;
            this.noMore = rs.total == rs.rows.length;
        }, { noDefaultHandler: true }).then(rs => {
            this.loading = false;
        });
    }

    $refs: {
        loadView: IMyLoad,
        chat: HTMLElement
    };

    private split = 0.8;
    private chatContent = '';
    private noMore = false;
    private lastId = null;
    private selfUserId = this.storeUser.user._id;
    chat = [];

    async chatSubmit(retryData?) {
        let data: any, pushData: any;
        if (!retryData) {
            data = {
                destUserId: this.detail._id,
                content: this.chatContent,
            };
            pushData = {
                ...data,
                userId: this.storeUser.user._id,
                createdAt: new Date(),
                key: randStr(),
            }
        } else {
            data = {
                destUserId: retryData.destUserId,
                content: retryData.content,
            };
            pushData = retryData;
        }
        pushData.sendStatus = myEnum.chatSendStatus.发送中;
        return this.operateHandler('', async () => {
            if (!retryData)
                this.chat.push(pushData);
            this.chatContent = '';
            await testApi.chatSubmit(data);
        }, { noDefaultHandler: true }).then(rs => {
            if (rs.success) {
                pushData.sendStatus = myEnum.chatSendStatus.发送成功;
            } else {
                pushData.sendStatus = myEnum.chatSendStatus.发送失败;
            }
            let idx = this.chat.findIndex(ele => ele.key === pushData.key);
            this.chat.splice(idx, 1, pushData);
        });
    }

    scrollLoad() {
        if (!this.noMore && !this.loading) {
            this.loadChat();
        }
    }

    render() {
        return (
            <div>
                <MyLoad
                    ref="loadView"
                    loadFn={this.getUserDetail}
                    renderFn={() => {
                        return (
                            <Card>
                                <div slot="title">
                                    <UserAvatarView user={this.detail} />
                                </div>
                                <Split v-model={this.split} mode="vertical" style={{ height: '400px', border: '1px solid #dcdee2' }}>
                                    <div ref='chat' slot="top" style={{
                                        textAlign: 'center',
                                        height: '100%', width: '100%', paddingBottom: '7px', overflowY: 'auto',
                                        padding: '5px'
                                    }} on-scroll={(e) => {
                                        if (e.target.scrollTop === 0)
                                            this.scrollLoad();
                                    }}>
                                        {this.noMore && <p style={{ margin: '5px' }}>没有更多消息了</p>}
                                        {this.loading && <Icon type="ios-loading" size={18} class="loading-icon" />}
                                        {this.chat.length === 0 ? <p>暂无消息</p> : this.chat.map(ele => {
                                            let self = ele.userId === this.selfUserId;
                                            let style: any = {
                                                justifyContent: self ? 'flex-end' : 'flex-start',
                                                display: 'flex',
                                                alignItems: 'center',
                                            };
                                            return [
                                                <Time time={ele.createdAt} />,
                                                <div style={style}>
                                                    {ele.sendStatus === myEnum.chatSendStatus.发送中 && <Icon type="ios-loading" size={18} class="loading-icon" />}
                                                    {ele.sendStatus === myEnum.chatSendStatus.发送失败 &&
                                                        <Icon type="ios-refresh-circle" size={18} style={{ cursor: 'pointer' }} on-click={() => {
                                                            this.chatSubmit(ele);
                                                        }}></Icon>
                                                    }
                                                    <div class="chat-content" >
                                                        {ele.content}
                                                    </div>
                                                </div>
                                            ];
                                        })}
                                    </div>
                                    <div slot="bottom" style={{
                                        display: 'flex', height: '100%', width: '100%',
                                        paddingTop: '7px'
                                    }}>
                                        <textarea v-model={this.chatContent} style={{ resize: 'none', height: 'inherit', width: 'inherit', border: 0, padding: '5px 10px' }} />
                                    </div>
                                </Split>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                    <Button type="primary" on-click={() => {
                                        this.chatSubmit();
                                    }}>发送</Button>
                                </div>
                            </Card>
                        );
                    }} />
            </div >
        );
    }
}

const UserChatView = convClass<UserChat>(UserChat);
export default UserChatView;