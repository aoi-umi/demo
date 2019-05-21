import { Component, Vue, Watch, Prop } from "vue-property-decorator";

import * as router from './router';
const routeConfig = router.routerConfig;
import "./App.less";
import {
    Button, Drawer,
    Menu, MenuItem, Submenu, MenuGroup,
    Icon, Content, Sider, Layout, Header
} from "./components/iview";

@Component
export default class App extends Vue {
    drawerOpen = false;
    isCollapsed = true;
    theme = "light" as any;
    title = '';

    protected created() {
        this.setTitle();
    }
    get menuitemClasses() {
        return ["menu-item", this.isCollapsed ? "collapsed-menu" : ""];
    }

    setTitle() {
        let cfg = router.getConfigByPath(location.pathname);
        this.title = (cfg && cfg.title) || '';
    }
    collapsedSider() {
        (this.$refs.side1 as any).toggleCollapse();
    }

    renderTopNav() {
        return (
            <div style={{ position: 'fixed' }}>
                <Menu
                    mode="horizontal"
                    // theme={this.theme}
                    active-name="1"
                >
                    <MenuItem>
                        <Icon type="md-menu" />
                    </MenuItem>
                    <MenuItem name="1">
                        <Icon type="ios-paper" />
                        内容管理
                    </MenuItem>
                    <MenuItem name="2">
                        <Icon type="ios-people" />
                        用户管理
                    </MenuItem>
                    <Submenu name="3">
                        <template slot="title">
                            <Icon type="ios-stats" />
                            统计分析
                        </template>
                        <MenuGroup title="使用">
                            <MenuItem name="3-1">新增和启动</MenuItem>
                            <MenuItem name="3-2">活跃分析</MenuItem>
                            <MenuItem name="3-3">时段分析</MenuItem>
                        </MenuGroup>
                        <MenuGroup title="留存">
                            <MenuItem name="3-4">用户留存</MenuItem>
                            <MenuItem name="3-5">流失用户</MenuItem>
                        </MenuGroup>
                    </Submenu>
                    <MenuItem name="4">
                        <Icon type="ios-construct" />
                        综合设置
                    </MenuItem>
                </Menu>
            </div>
        );
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

    render() {
        return (
            // <div id="app">
            //     {this.renderTopNav()}
            //     <div>
            //         <Button onClick={() => { this.drawerOpen = !this.drawerOpen }} type="primary">Open</Button>
            //         <Drawer title="Basic Drawer" placement="left" closable={false} value={this.drawerOpen}>
            //             <p>Some contents...</p>
            //             <p>Some contents...</p>
            //             <p>Some contents...</p>
            //         </Drawer>
            //     </div >
            //     <div id="nav">
            //         <router-link to="/">Home</router-link> |
            //         <router-link to="/about">About</router-link>
            //     </div>
            //     <router-view />
            // </div >
            <Layout class="layout">
                <Header style={{ padding: 0 }} class="layout-header-bar">
                    <Icon
                        onClick={this.collapsedSider}
                        class="menu-icon"
                        style={{ margin: "0 20px" }}
                        type="md-menu"
                        size="24"
                    />
                    <span>{this.title}</span>
                </Header>
                <Layout>
                    <Sider
                        ref="side1"
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
                                    name: routeConfig.home.path,
                                    to: routeConfig.home.path,
                                    icon: 'ios-home',
                                    text: routeConfig.home.title
                                }, {
                                    name: routeConfig.test.path,
                                    to: routeConfig.test.path,
                                    icon: 'ios-search',
                                    text: routeConfig.test.title
                                }, {
                                    name: routeConfig.bookmark.path,
                                    to: routeConfig.bookmark.path,
                                    icon: 'ios-settings',
                                    text: routeConfig.bookmark.title
                                },].map(data => { return this.renderMenu(data) })
                            }
                        </Menu>
                    </Sider>
                    <Content style={{ margin: "20px", background: "#fff", minHeight: "260px", padding: '5px' }}>
                        <router-view></router-view>
                    </Content>
                </Layout>
            </Layout>
        );
    }
}
