import { Component, Vue, Watch, Prop } from "vue-property-decorator";

import { routerConfig, MyRouteConfig } from '@/router';
import {
    Menu, MenuItem,
    Icon, Content, Sider, Layout, Header, Button, Modal, BackTop, Submenu, Spin,
} from "@/components/iview";
import * as style from '@/components/style';
import { LocalStore } from '@/store';

import { testApi, testSocket } from './api';
import { dev, env } from './config';
import { SignInView } from './views/user/user-sign';
import { Base } from './views/base';
import { UserAvatarView } from './views/comps/user-avatar';
import "./App.less";

@Component
export default class App extends Base {
    drawerOpen = false;
    isCollapsed = true;
    theme = "light" as any;
    title = '';
    activeName = '';
    $refs: { sider: any, menu: iView.Menu };

    async logPV() {
        testApi.statPVSave({ path: this.$route.path });
    }

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
        this.setMenuCfg();
        this.activeName = this.getActiveNameByPath(location.pathname);
        testApi.serverInfo();
        this.logPV();
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
    get menuClasses() {
        return ["menu", this.isCollapsed ? "collapsed-menu" : ""];
    }

    setTitle() {
        this.title = this.$route.meta.title || '';
        document.title = this.title || env.title;
    }
    getingUserInfo = false;
    async getUserInfo() {
        this.getingUserInfo = true;
        let token = LocalStore.getItem(dev.cacheKey.testUser);
        if (token) {
            await testApi.userInfo().then(user => {
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
                token = '';
                console.error(e);
            });
        }
        this.getingUserInfo = false;

        if (token && testSocket.socket.connected) {
            testSocket.login({ [dev.cacheKey.testUser]: token });
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
            <MenuItem key={data.to} class="menu-item" name={name} to={data.to}>
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
        this.logPV();
        if (!this.isCollapsed)
            this.isCollapsed = true;
    }

    private menuCfg: MenuConfig[] = [];
    private setMenuCfg() {
        this.menuCfg = [{
            routerConfig: routerConfig.bookmark,
            icon: 'md-home',
            show: false,
        }, {
            routerConfig: routerConfig.video,
            icon: 'logo-youtube',
        }, {
            routerConfig: routerConfig.article,
            icon: 'md-paper',
        }, {
            routerConfig: routerConfig.goods,
            icon: 'md-cart',
        }, {
            routerConfig: routerConfig.contentMgt,
            icon: 'md-create',
        }, {
            routerConfig: routerConfig.payMgt,
            icon: 'logo-usd',
        }, {
            routerConfig: routerConfig.assetMgt,
            icon: 'md-stats',
            text: routerConfig.assetMgt.text,
        }, {
            routerConfig: routerConfig.goodsMgt,
            icon: 'md-nutrition',
        }, {
            routerConfig: routerConfig.userMgt,
            icon: 'md-people',
        }, {
            routerConfig: routerConfig.role,
            icon: 'md-person',
        }, {
            routerConfig: routerConfig.authority,
            icon: 'md-lock',
        }, {
            routerConfig: routerConfig.apps,
            icon: 'md-apps',
        }, {
            routerConfig: routerConfig.setting,
            icon: 'md-settings',
        }, {
            routerConfig: routerConfig.stat,
            icon: 'md-pie',
        }].map(ele => {
            let { routerConfig, ...rest } = ele;
            let obj = {} as any;
            let routeCfg = routerConfig as MyRouteConfig;
            if (routeCfg) {
                obj.to = routeCfg.path;
                obj.text = routeCfg.text;
                if (routeCfg.meta.authority)
                    obj.show = () => this.storeUser.user.hasAuth(routeCfg.meta.authority)
            }
            obj = { ...obj, ...rest };
            return obj;
        });
    }

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
                    }} on-3rd-party-login-click={() => {
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
                            class={this.menuClasses}
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
                        {
                            this.getingUserInfo ? <Spin fix /> :
                                this.$route.meta.keepAlive ?
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