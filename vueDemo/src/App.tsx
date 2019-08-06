import { Component, Vue, Watch, Prop } from "vue-property-decorator";

import * as router from '@/router';
import {
    Menu, MenuItem, Option,
    Icon, Content, Sider, Layout, Header, Button, Row, Col, Poptip, Avatar, Modal,
} from "@/components/iview";

import { testApi } from './api';
import { dev, authority } from './config';
const routeConfig = router.routerConfig;
import "./App.less";
import { SignInView } from './views/user';
import { Base } from './views/base';
import { UserAvatarView } from './views/user-avatar';

@Component
export default class App extends Base {
    drawerOpen = false;
    isCollapsed = true;
    theme = "light" as any;
    title = '';
    activeName = this.getActiveNameByPath(location.pathname);
    $refs: { sider: any };

    getActiveNameByPath(path: string) {
        return path.split('/')[1];
    }

    protected created() {
        this.setTitle();
        this.getUserInfo();
    }
    get menuitemClasses() {
        return ["menu-item", this.isCollapsed ? "collapsed-menu" : ""];
    }

    setTitle() {
        this.title = this.$route.meta.title || '';
    }
    async getUserInfo() {
        let token = localStorage.getItem(dev.cacheKey.testUser);
        if (token) {
            await testApi.userInfo().then(user => {
                this.storeUser.setUser(user);
                if (user) {
                    if (location.pathname === routeConfig.userSignIn.path) {
                        let { to, ...query } = this.$route.query;
                        to = (to as string) || routeConfig.index.path;
                        let toQuery = query;
                        this.$router.push({ path: to, query: toQuery });
                    }
                }
            }).catch(e => {
                this.$Message.error(e.message);
            });
        }
    }

    collapsedSider() {
        this.$refs.sider.toggleCollapse();
    }

    renderMenu(data: MenuConfig) {
        let name = data.name;
        if (!name)
            name = this.getActiveNameByPath(data.to);
        return (
            <MenuItem name={name} to={data.to}>
                <Icon type={data.icon} />
                <span>{data.text}</span>
            </MenuItem>
        );
    }

    @Watch('$route')
    route(to, from) {
        this.setTitle();
        this.activeName = this.getActiveNameByPath(location.pathname);
    }

    signInShow = false;

    render() {
        return (
            <Layout class="layout">
                <Modal v-model={this.signInShow} footer-hide>
                    <SignInView on-success={() => {
                        this.signInShow = false;
                    }} />
                </Modal>
                <Header class="layout-header-bar">
                    <Icon
                        on-click={this.collapsedSider}
                        class="menu-icon"
                        style={{ margin: "0 20px" }}
                        type="md-menu"
                        size="24"
                    />
                    <span>{this.title}</span>
                    <div class="layout-header-right">
                        {this.storeUser.user.isLogin ?
                            <UserAvatarView user={this.storeUser.user} self /> :
                            [
                                <Button type="primary" on-click={() => {
                                    this.signInShow = true;
                                }}>登录</Button>,
                                <Button on-click={() => {
                                    this.$router.push(routeConfig.userSignUp.path);
                                }}>注册</Button>
                            ]
                        }
                    </div>
                </Header>
                <Layout>
                    <Sider
                        class="side-menu"
                        ref="sider"
                        hide-trigger
                        collapsible
                        collapsed-width="78"
                        v-model={this.isCollapsed}
                    >
                        <Menu
                            active-name={this.activeName}
                            theme={"dark"}
                            width="auto"
                            class={this.menuitemClasses}
                        >
                            {
                                [{
                                    to: routeConfig.bookmark.path,
                                    icon: 'md-home',
                                    text: routeConfig.bookmark.text,
                                }, {
                                    to: routeConfig.article.path,
                                    icon: 'md-paper',
                                    text: routeConfig.article.text,
                                }, {
                                    to: routeConfig.articleMgt.path,
                                    icon: 'md-create',
                                    text: routeConfig.articleMgt.text,
                                    show: this.storeUser.user.hasAuth(authority.login)
                                }, {
                                    to: routeConfig.user.path,
                                    icon: 'md-people',
                                    text: routeConfig.user.text,
                                    show: this.storeUser.user.hasAuth(authority.userMgtQuery)
                                }, {
                                    to: routeConfig.role.path,
                                    icon: 'md-person',
                                    text: routeConfig.role.text,
                                    show: this.storeUser.user.hasAuth(authority.roleQuery)
                                }, {
                                    to: routeConfig.authority.path,
                                    icon: 'md-lock',
                                    text: routeConfig.authority.text,
                                    show: this.storeUser.user.hasAuth(authority.authorityQuery)
                                },].filter((ele: MenuConfig) => {
                                    let show = ele.show;
                                    if (!ele.hasOwnProperty('show')) {
                                        show = true;
                                    }
                                    return show;
                                }).map(data => { return this.renderMenu(data); })
                            }
                        </Menu>
                    </Sider>
                    <Content class={["side-menu-blank", this.isCollapsed ? '' : 'side-open']}></Content>
                    <Content class="main-content">
                        <router-view></router-view>
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

type MenuConfig = {
    name?: string;
    to: string;
    text: string;
    icon: string;
    show?: boolean;
};