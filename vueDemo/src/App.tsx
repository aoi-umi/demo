import { Component, Vue, Watch, Prop } from "vue-property-decorator";

import * as router from './router';
const routeConfig = router.routerConfig;
import "./App.less";
import {
    Menu, MenuItem, Submenu, MenuGroup,
    Icon, Content, Sider, Layout, Header,
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
        this.title = this.$route.meta.title || '';
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
            <Layout class="layout">
                <Header style={{ padding: 0 }} class="layout-header-bar">
                    <Icon
                        on-click={this.collapsedSider}
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
                    <Content style={{ margin: "20px", minHeight: "260px", padding: '5px' }}>
                        <router-view></router-view>
                    </Content>
                </Layout>
            </Layout>
        );
    }
}
