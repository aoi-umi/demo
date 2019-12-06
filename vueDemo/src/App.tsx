import { Component, Vue, Watch, Prop } from "vue-property-decorator";

import { routerConfig } from '@/router';
import {
    Menu, MenuItem,
    Icon, Content, Sider, Layout, Header, Button, Modal, BackTop, Submenu,
} from "@/components/iview";
import * as style from '@/components/style';
import { LocalStore } from '@/store';

import { testApi, testSocket } from './api';
import { dev, authority, env } from './config';
import "./App.less";
import { SignInView } from './views/user/user-sign';
import { Base } from './views/base';
import { UserAvatarView } from './views/comps/user-avatar';

@Component
export default class App extends Base {
    drawerOpen = false;
    isCollapsed = true;
    theme = "light" as any;
    title = '';
    activeName = '';
    $refs: { sider: any, menu: iView.Menu };

    getActiveNameByPath(path: string) {
        let name = '';
        let matchLen = 0;
        this.menuCfg.forEach(ele => {
            if (path.startsWith(ele.to) && ele.to.length > matchLen) {
                name = ele.to;
                matchLen = ele.to.length;
            }
        });
        return name;
    }

    protected created() {
        this.setTitle();
        this.getUserInfo();
        this.handleResize();
        this.activeName = this.getActiveNameByPath(location.pathname);
    }

    private isSmall = false;
    protected mounted() {
        window.addEventListener('resize', this.handleResize);
    }

    protected beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
    }

    private handleResize() {
        this.isSmall = document.body.clientWidth < 576;
    }
    get menuitemClasses() {
        return ["menu", this.isCollapsed ? "collapsed-menu" : ""];
    }

    setTitle() {
        this.title = this.$route.meta.title || '';
        document.title = this.title || env.title;
    }
    async getUserInfo() {
        let token = LocalStore.getItem(dev.cacheKey.testUser);
        if (token) {
            await testApi.userInfo().then(user => {
                testSocket.login({ [dev.cacheKey.testUser]: token });
                this.storeUser.setUser(user);
                if (user) {
                    if (location.pathname === routerConfig.userSignIn.path) {
                        let { to, ...query } = this.$route.query;
                        to = (to as string) || routerConfig.index.path;
                        let toQuery = query;
                        this.$router.push({ path: to, query: toQuery });
                    }
                }
            }).catch(e => {
                console.error(e);
            });
        }
    }

    collapsedSider() {
        this.$refs.sider.toggleCollapse();
    }

    getMenuName(data: MenuConfig) {
        let name = data.name;
        if (!name)
            name = this.getActiveNameByPath(data.to);
        return name;
    }

    filterMenu(list: MenuConfig[]) {
        return list.filter((ele: MenuConfig) => {
            let show = ele.show;
            if (!ele.hasOwnProperty('show')) {
                show = true;
            } else if (typeof ele.show === 'function') {
                show = ele.show();
            }
            return show;
        });
    }

    renderMenu(data: MenuConfig) {
        if (!data.children) {
            return this.getMenu(data);
        }

        let name = this.getMenuName(data);
        return (
            <Submenu class="menu-sub-menu" name={name}>
                <template slot="title">
                    <Icon type={data.icon} />
                    <span class="menu-text">{data.text}</span>
                </template>
                {this.filterMenu(data.children).map(ele => this.getMenu(ele))}
            </Submenu>
        );
    }

    getMenu(data: MenuConfig) {
        let name = this.getMenuName(data);
        return (
            <MenuItem class="menu-item" name={name} to={data.to}>
                <Icon type={data.icon} />
                <span class="menu-text">{data.text}</span>
            </MenuItem>
        );
    }

    private openNames = [];
    @Watch('openNames')
    private watchOpenNames() {
        this.$nextTick(() => {
            this.$refs.menu.updateOpened();
        });
    }

    @Watch('$route')
    route(to, from) {
        this.setTitle();
        this.activeName = this.getActiveNameByPath(location.pathname);
    }

    private menuCfg: MenuConfig[] = [{
        to: routerConfig.bookmark.path,
        icon: 'md-home',
        text: routerConfig.bookmark.text,
        show: false,
    }, {
        to: routerConfig.video.path,
        icon: 'logo-youtube',
        text: routerConfig.video.text,
    }, {
        to: routerConfig.article.path,
        icon: 'md-paper',
        text: routerConfig.article.text,
    }, {
        to: routerConfig.goods.path,
        icon: 'md-cart',
        text: routerConfig.goods.text,
    }, {
        to: routerConfig.contentMgt.path,
        icon: 'md-create',
        text: routerConfig.contentMgt.text,
        show: () => this.storeUser.user.hasAuth(routerConfig.contentMgt.meta.authority)
    }, {
        to: routerConfig.payMgt.path,
        icon: 'logo-usd',
        text: routerConfig.payMgt.text,
        show: () => this.storeUser.user.hasAuth(routerConfig.payMgt.meta.authority)
    }, {
        to: routerConfig.assetMgt.path,
        icon: 'md-stats',
        text: routerConfig.assetMgt.text,
        show: () => this.storeUser.user.hasAuth(routerConfig.assetMgt.meta.authority)
    }, {
        to: routerConfig.goodsMgt.path,
        icon: 'md-nutrition',
        text: routerConfig.goodsMgt.text,
        show: () => this.storeUser.user.hasAuth(routerConfig.goodsMgt.meta.authority)
    }, {
        to: routerConfig.userMgt.path,
        icon: 'md-people',
        text: routerConfig.userMgt.text,
        show: () => this.storeUser.user.hasAuth(routerConfig.userMgt.meta.authority)
    }, {
        to: routerConfig.role.path,
        icon: 'md-person',
        text: routerConfig.role.text,
        show: () => this.storeUser.user.hasAuth(routerConfig.role.meta.authority)
    }, {
        to: routerConfig.authority.path,
        icon: 'md-lock',
        text: routerConfig.authority.text,
        show: () => this.storeUser.user.hasAuth(routerConfig.authority.meta.authority)
    }, {
        to: routerConfig.setting.path,
        icon: 'md-settings',
        text: routerConfig.setting.text,
        show: () => this.storeUser.user.hasAuth(routerConfig.setting.meta.authority)
    },];

    private siderWidth = 180;
    render() {
        let collapsedWidth = this.isSmall ? 0 : 58;
        return (
            <Layout class="layout no-bg">
                <Modal v-model={this.storeSetting.setting.signInShow} footer-hide>
                    <SignInView on-success={() => {
                        this.storeSetting.setSetting({
                            signInShow: false
                        });
                    }} />
                </Modal>
                <Header class="layout-header-bar">
                    <Icon
                        on-click={this.collapsedSider}
                        class="menu-icon"
                        type="md-menu"
                        size="24"
                    />
                    <span>{this.title}</span>
                    <div class="layout-header-right">
                        {this.storeUser.user.isLogin ?
                            <UserAvatarView user={this.storeUser.user} self tipsPlacement="bottom" /> :
                            [
                                <Button type="primary" on-click={() => {
                                    this.storeSetting.setSetting({
                                        signInShow: true
                                    });
                                }}>登录</Button>,
                                <Button on-click={() => {
                                    this.$router.push(routerConfig.userSignUp.path);
                                }}>注册</Button>
                            ]
                        }
                    </div>
                </Header>
                <Layout class={["no-bg", this.isCollapsed ? "" : "side-menu-open"]}>
                    <Sider
                        class="side-menu"
                        ref="sider"
                        hide-trigger
                        collapsible
                        collapsed-width={collapsedWidth}
                        width={this.siderWidth}
                        v-model={this.isCollapsed}
                    >
                        <Menu
                            ref='menu'
                            active-name={this.activeName}
                            theme={"dark"}
                            width="auto"
                            class={this.menuitemClasses}
                            open-names={this.openNames}
                            on-on-select={() => {
                                if (this.isSmall)
                                    this.isCollapsed = true;
                            }}
                        >
                            {this.filterMenu(this.menuCfg).map(data => { return this.renderMenu(data); })}
                        </Menu>
                    </Sider>
                    {!this.isSmall ? <Content class={["side-menu-blank"]} style={{
                        flex: `0 0 ${this.isCollapsed ? collapsedWidth : this.siderWidth}px`
                    }}></Content> :
                        <transition name="fade">
                            <div class={[style.cls.mask, 'menu-mask']} v-show={!this.isCollapsed} on-click={() => {
                                this.isCollapsed = true;
                            }}></div>
                        </transition>
                    }
                    <Content class="main-content">
                        {this.$route.meta.keepAlive ?
                            <keep-alive>
                                <router-view></router-view>
                            </keep-alive> :
                            <router-view></router-view>
                        }
                    </Content>
                    <BackTop bottom={100} right={10} />
                </Layout>
            </Layout>
        );
    }
}

type MenuConfig = {
    name?: string;
    to: string;
    text: string;
    icon?: string;
    show?: boolean | (() => boolean);
    children?: MenuConfig[];
};