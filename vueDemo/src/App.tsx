import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import * as router from '@/router';
import {
    Menu, MenuItem, Option,
    Icon, Content, Sider, Layout, Header, Button, Row, Col, Poptip, Avatar, Modal,
} from "@/components/iview";
import { testApi } from './api';
import { dev } from './config';
const routeConfig = router.routerConfig;
import "./App.less";
import { SignInView } from './views/user';

@Component
export default class App extends Vue {
    drawerOpen = false;
    isCollapsed = true;
    theme = "light" as any;
    title = '';
    private get innerRefs() {
        return this.$refs as { sider: any }
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
            let user = await testApi.userInfo();
            this.$store.commit('setUser', user);
            if (user) {
                if (location.pathname === routeConfig.userSignIn.path) {
                    let { to, ...query } = this.$route.query;
                    to = (to as string) || routeConfig.index.path;
                    let toQuery = query;
                    this.$router.push({ path: to, query: toQuery });
                }
            }
        }
    }
    collapsedSider() {
        this.innerRefs.sider.toggleCollapse();
    }

    renderMenu(data) {
        return (
            <MenuItem name={data.name} to={data.to}>
                <Icon type={data.icon} />
                <span>{data.text}</span>
            </MenuItem>
        );
    }

    @Watch('$route')
    route(to, from) {
        this.setTitle();
    }

    signInShow = false;
    signOut() {
        let token = localStorage.getItem(dev.cacheKey.testUser);
        if (token) {
            testApi.userSignOut();
        }
        this.$store.commit('setUser', null);
        localStorage.removeItem(dev.cacheKey.testUser);
    }

    render() {
        return (
            <Layout class="layout">
                <Modal v-model={this.signInShow} footer-hide>
                    <SignInView on-success={() => {
                        this.signInShow = false;
                    }}></SignInView>
                </Modal>
                <Header style={{ padding: 0 }} class="layout-header-bar">
                    <Icon
                        on-click={this.collapsedSider}
                        class="menu-icon"
                        style={{ margin: "0 20px" }}
                        type="md-menu"
                        size="24"
                    />
                    <span>{this.title}</span>
                    <div class="layout-header-right">
                        {this.$store.state.user ?
                            <Poptip trigger="hover">
                                <Avatar icon="md-person" style={{ marginRight: '10px' }} />
                                <span>{this.$store.state.user.nickname}</span>
                                <div slot="content">
                                    <p class="ivu-select-item" on-click={() => {
                                        this.$router.push(routeConfig.userInfo.path);
                                    }}>主页</p>
                                    <p class="ivu-select-item" on-click={this.signOut}>退出</p>
                                </div>
                            </Poptip> :
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
                        ref="sider"
                        hide-trigger
                        collapsible
                        collapsed-width="78"
                        v-model={this.isCollapsed}
                    >
                        <Menu
                            active-name={location.pathname}
                            theme={"dark"}
                            width="auto"
                            class={this.menuitemClasses}
                        >
                            {
                                [{
                                    name: routeConfig.bookmark.path,
                                    to: routeConfig.bookmark.path,
                                    icon: 'md-home',
                                    text: routeConfig.bookmark.text
                                }, {
                                    name: routeConfig.user.path,
                                    to: routeConfig.user.path,
                                    icon: 'md-people',
                                    text: routeConfig.user.text
                                }, {
                                    name: routeConfig.role.path,
                                    to: routeConfig.role.path,
                                    icon: 'md-person',
                                    text: routeConfig.role.text
                                }, {
                                    name: routeConfig.authority.path,
                                    to: routeConfig.authority.path,
                                    icon: 'md-lock',
                                    text: routeConfig.authority.text
                                },].map(data => { return this.renderMenu(data) })
                            }
                        </Menu>
                    </Sider>
                    <Content class="main-content">
                        <router-view></router-view>
                    </Content>
                </Layout>
            </Layout>
        );
    }
}
