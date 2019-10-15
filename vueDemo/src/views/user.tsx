import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import * as iview from 'iview';
import moment from 'dayjs';

import * as helpers from '@/helpers';
import { dev, myEnum } from '@/config';
import { routerConfig } from '@/router';
import { testApi, testSocket } from '@/api';
import { convClass } from '@/components/utils';
import { Modal, Input, Form, FormItem, Button, Card, TabPane, Tabs, Time } from '@/components/iview';
import { MyUpload, IMyUpload, FileDataType } from '@/components/my-upload';
import { MyList, IMyList, ResultType } from '@/components/my-list';
import { MyLoad, IMyLoad } from '@/components/my-load';
import { Utils } from '@/components/utils';
import { LoginUser } from '@/model/user';

import { UserAvatarView } from './comps/user-avatar';
import { FollowButtonView } from './comps/follow-button';
import { AuthorityTagView } from './comps/authority-tag';
import { RoleTagView } from './comps/role-tag';

import { Base } from './base';
import { DetailDataType as UserDetailDataType } from './user-mgt';
import Article, { ArticleListItemView, ArticleView } from './article';
import { ChatList, ChatListView } from './user-chat';

@Component
export default class UserInfo extends Base {
    detail: UserDetailDataType = {};
    tab = '';
    mounted() {
        this.load();
    }

    @Watch('$route')
    route(to, from) {
        this.load();
    }

    async load() {
        let query = this.$route.query as { [key: string]: string };
        let loadRs = this.$refs.loadView.result;
        if (!loadRs.success)
            await this.$refs.loadView.loadData();
        if (loadRs.success) {
            if (myEnum.userTab.getAllValue().includes(query.tab)) {
                this.tab = query.tab;
            }
            this.changeTab();
        }
    }

    private changeTab() {
        if (this.tab === myEnum.userTab.粉丝 && !this.tabLoaded.follower) {
            this.handleFollowSearch(myEnum.followQueryType.粉丝);
        } else if (this.tab === myEnum.userTab.关注 && !this.tabLoaded.following) {
            this.handleFollowSearch(myEnum.followQueryType.关注);
        } else if (this.tab === myEnum.userTab.文章 && !this.tabLoaded.article) {
            this.handleArticleSearch();
        } else if (this.tab === myEnum.userTab.私信 && !this.tabLoaded.chat) {
            this.handleChatSearch();
        }
    }

    async getUserDetail() {
        let query = this.$route.query;
        let detail: UserDetailDataType;
        let self = !query._id || query._id == this.storeUser.user._id;
        if (self) {
            detail = await testApi.userDetail();
        } else {
            detail = await testApi.userDetailQuery(query._id);
        }
        detail.self = self;
        this.detail = detail;
        return detail;
    }

    $refs: {
        formVaild: iview.Form, loadView: IMyLoad, upload: IMyUpload,
        followerList: FollowList, followingList: FollowList,
        articleList: Article, chatList: ChatList,
    };
    updateLoading = false;
    private getUpdateUser() {
        return {
            avatar: '',
            avatarUrl: '',
            nickname: '',
            pwd: '',
            newPwd: '',
            newPwdRepeat: '',
            profile: ''
        };
    }
    updateDetail = this.getUpdateUser();
    updateShow = false;
    avatarList = [];
    async toggleUpdate(show: boolean) {
        this.updateShow = show;
        if (show) {
            this.updateDetail = {
                ...this.getUpdateUser(),
                avatar: this.detail.avatar,
                avatarUrl: this.detail.avatarUrl,
                nickname: this.detail.nickname,
                profile: this.detail.profile,
            };
            this.avatarList = this.updateDetail.avatarUrl ? [{ url: this.updateDetail.avatarUrl, fileType: FileDataType.图片 }] : [];
            this.setRules();
        }
    }
    private rules = {};
    private setRules() {
        this.rules = {
            pwd: [{
                validator: (rule, value, callback) => {
                    if (this.updateDetail.newPwd && !value) {
                        callback(new Error('请输入密码'));
                    } else {
                        callback();
                    }
                },
                trigger: 'blur'
            }],
            newPwd: [{
                validator: (rule, value, callback) => {
                    if (value && value === this.updateDetail.pwd) {
                        callback(new Error('新旧密码相同'));
                    } else {
                        callback();
                    }
                },
                trigger: 'blur'
            }],
            newPwdRepeat: [{
                validator: (rule, value, callback) => {
                    if (this.updateDetail.newPwd && value !== this.updateDetail.newPwd) {
                        callback(new Error('两次输入密码不一致'));
                    } else {
                        callback();
                    }
                },
                trigger: 'blur'
            }],
        };
    }

    handleUpdate() {
        this.operateHandler('修改', async () => {
            this.updateLoading = true;
            let upload = this.$refs.upload;
            let err = await upload.upload();
            if (err.length) {
                throw new Error(`上传头像失败:${err[0]}`);
            }
            let file = upload.fileList[0];
            if (file && file.uploadRes)
                this.updateDetail.avatar = file.uploadRes;

            let user = this.storeUser.user;
            let req: any = {};
            let logOut = false;
            function isUpdate(newVal, oldVal) {
                return newVal && newVal != oldVal
            }
            let detail = this.detail;
            let updateKey = ['nickname', 'profile', 'avatar'];
            updateKey.forEach(key => {
                if (isUpdate(this.updateDetail[key], detail[key]))
                    req[key] = this.updateDetail[key];
            });
            if (this.updateDetail.newPwd) {
                logOut = true;
                req = {
                    ...req,
                    newPassword: this.updateDetail.newPwd,
                    round: helpers.randStr(),
                };
                let token = LoginUser.createToken(user.account, this.updateDetail.pwd, req);
                req = {
                    ...req,
                    token
                };
            }
            if (Object.keys(req).length) {
                let rs = await testApi.userUpdate(req);
                if (logOut)
                    this.storeUser.setUser(null);
                else {
                    this.storeUser.setUser({
                        ...this.storeUser.user,
                        ...rs,
                    });
                    this.detail = {
                        ...this.detail,
                        ...rs,
                    };
                }
            }
            this.toggleUpdate(false);
        }, {
            validate: this.$refs.formVaild.validate
        }
        ).finally(() => {
            this.updateLoading = false;
        });
    }

    private handlePress(e) {
        if (this.isPressEnter(e)) {
            this.handleUpdate();
        }
    }

    private tabLoaded = {
        following: false,
        follower: false,
        article: false,
        chat: false,
    };

    private handleFollowSearch(type) {
        if (type == myEnum.followQueryType.粉丝) {
            this.$refs.followerList.query();
            this.tabLoaded.follower = true;
        } else {
            this.$refs.followingList.query();
            this.tabLoaded.following = true;
        }
    }

    private handleArticleSearch() {
        this.$refs.articleList.query();
        this.tabLoaded.article = true;
    }

    private handleChatSearch() {
        this.$refs.chatList.query();
        this.tabLoaded.chat = true;
    }

    renderInfo() {
        let detail = this.detail;
        return (
            <div style={{
                // background: 'rgba(255,255,255,0.6)'
            }}>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <UserAvatarView user={detail} size="large" noTips showAccount style={{ marginLeft: '10px' }} />
                    {detail.self && <a on-click={() => {
                        this.toggleUpdate(true);
                    }} style={{ marginLeft: '5px' }}>修改</a>}
                    <div style={{ flexGrow: 1 }}></div>
                    {!detail.self && <FollowButtonView style={{ alignItems: 'flex-end' }} user={detail} />}
                </div>
                <Tabs animated={false} v-model={this.tab} style={{ minHeight: '300px' }} on-on-click={(name: string) => {
                    this.$router.push({
                        path: this.$route.path,
                        query: {
                            ...this.$route.query,
                            tab: name
                        }
                    });
                }}>
                    <TabPane label="概览">
                        {detail.self ?
                            <Form class="form-no-error" label-width={60}>
                                <FormItem label="状态">
                                    {detail.statusText}
                                </FormItem>
                                <FormItem label="简介">
                                    {detail.profile || dev.defaultProfile}
                                </FormItem>
                                <FormItem label="角色">
                                    <RoleTagView value={detail.roleList} hideCode />
                                </FormItem>
                                <FormItem label="权限">
                                    <AuthorityTagView value={detail.authorityList} hideCode />
                                </FormItem>
                                <FormItem label="可用权限">
                                    <AuthorityTagView value={Object.values(detail.auth)} hideCode />
                                </FormItem>
                                <FormItem label="注册时间">
                                    {detail.createdAt && moment(detail.createdAt).format(dev.dateFormat)}
                                </FormItem>
                            </Form> :
                            <Form class="form-no-error" label-width={60}>
                                <FormItem label="简介">
                                    {detail.profile || dev.defaultProfile}
                                </FormItem>
                                <FormItem label="注册时间">
                                    {detail.createdAt && moment(detail.createdAt).format(dev.dateFormat)}
                                </FormItem>
                            </Form>
                        }
                    </TabPane>
                    <TabPane name={myEnum.userTab.文章} label={() => {
                        return <div>文章: {detail.article}</div>
                    }}>
                        <ArticleView ref="articleList" notQueryOnRoute notQueryToRoute notQueryOnMounted />
                    </TabPane>
                    <TabPane name={myEnum.userTab.粉丝} label={() => {
                        return <div>粉丝: {detail.follower}</div>
                    }}>
                        <FollowListView ref="followerList" userId={this.detail._id} followType={myEnum.followQueryType.粉丝} />
                    </TabPane>
                    <TabPane name={myEnum.userTab.关注} label={() => {
                        return <div>关注: {detail.following}</div>
                    }}>
                        <FollowListView ref="followingList" userId={this.detail._id} followType={myEnum.followQueryType.关注} />
                    </TabPane>
                    <TabPane name={myEnum.userTab.私信} label={() => {
                        return <div>私信</div>
                    }}>
                        <ChatListView ref="chatList" />
                    </TabPane>
                </Tabs>
            </div>
        );
    }

    render() {
        return (
            <div>
                <MyLoad
                    ref="loadView"
                    loadFn={this.getUserDetail}
                    renderFn={() => {
                        return this.renderInfo();
                    }} />

                <Modal v-model={this.updateShow} footer-hide>
                    <div class="dialog-view" on-keypress={this.handlePress}>
                        <h3>修改</h3>
                        <br />
                        <Form class="dialog-content" ref="formVaild" props={{ model: this.updateDetail }} rules={this.rules}>
                            <FormItem prop="avatar">
                                <MyUpload
                                    class="center"
                                    ref='upload'
                                    headers={testApi.defaultHeaders}
                                    uploadUrl={testApi.imgUploadUrl}
                                    successHandler={(res, file) => {
                                        let rs = testApi.uplodaHandler(res);
                                        file.url = rs.url;
                                        return rs.fileId;
                                    }}
                                    format={['jpg', 'png', 'bmp', 'gif']}
                                    width={120} height={120}
                                    cropperOptions={{
                                        autoCropWidth: 288,
                                        autoCropHeight: 288,
                                        fixedNumber: [1, 1],
                                    }}
                                    v-model={this.avatarList}
                                    shape="circle"
                                />
                            </FormItem>
                            <FormItem prop="nickname">
                                <span>昵称</span>
                                <Input v-model={this.updateDetail.nickname} />
                            </FormItem>
                            <FormItem prop="pwd">
                                <span>密码</span>
                                <Input v-model={this.updateDetail.pwd} type="password" placeholder="不修改密码时不用填" />
                            </FormItem>
                            <FormItem prop="newPwd">
                                <span>新密码</span>
                                <Input v-model={this.updateDetail.newPwd} type="password" />
                            </FormItem>
                            <FormItem prop="newPwdRepeat">
                                <span>确认密码</span>
                                <Input v-model={this.updateDetail.newPwdRepeat} type="password" />
                            </FormItem>
                            <FormItem prop="profile">
                                <span>简介</span>
                                <Input v-model={this.updateDetail.profile} placeholder={dev.defaultProfile} type="textarea" />
                            </FormItem>
                            <FormItem>
                                <Button type="primary" long on-click={this.handleUpdate} loading={this.updateLoading}>修改</Button>
                            </FormItem>
                        </Form>
                    </div>
                </Modal>
            </div >
        );
    }
}

/**
 * 粉丝/关注
 */
@Component
class FollowList extends Base {
    @Prop({
        required: true
    })
    userId: string;

    @Prop({
        required: true
    })
    followType: number;

    $refs: {
        list: IMyList<any>,
    };
    followerAnyKey = '';

    query() {
        this.$refs.list.handleQuery({ resetPage: true });
    }

    private async followQuery() {
        let opt = {
            anyKey: this.followerAnyKey,
            userId: this.userId,
            type: this.followType,
        };

        await this.$refs.list.query(opt);
    }

    private renderFollow(rs: ResultType) {
        if (!rs.success || !rs.data.length) {
            let msg = !rs.success ? rs.msg : '空空的';
            return (
                <Card class="center" style={{ marginTop: '5px' }}>{msg}</Card>
            );
        }
        return rs.data.map(ele => {
            let user = this.followType == myEnum.followQueryType.粉丝 ? ele.followerUser : ele.followingUser;
            return (
                <Card style={{ marginTop: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'baseline' }}>
                        <UserAvatarView user={user} />
                        <span style={{ marginLeft: '5px' }}>{user.profile || dev.defaultProfile}</span>
                        <div class="flex-stretch">
                        </div>
                        <FollowButtonView user={user} />
                    </div>
                </Card>
            )
        });
    }

    render() {
        return (
            <div>
                <Input v-model={this.followerAnyKey} search on-on-search={() => {
                    this.query();
                }} />
                <MyList
                    ref="list"
                    type="custom"
                    hideSearchBox
                    on-query={(t) => {
                        this.followQuery();
                    }}

                    queryFn={async (data) => {
                        let rs = await testApi.followQuery(data);
                        return rs;
                    }}

                    customRenderFn={(rs) => {
                        return this.renderFollow(rs);
                    }}
                />
            </div>
        );
    }
}

const FollowListView = convClass<FollowList>(FollowList);