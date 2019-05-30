import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import * as router from '@/router';
import {
    Menu, MenuItem, Submenu, MenuGroup,
    Icon, Content, Sider, Layout, Header, Button, Row, Col,
} from "@/components/iview";
const routeConfig = router.routerConfig;
import "./App.less";

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
    }
    get menuitemClasses() {
        return ["menu-item", this.isCollapsed ? "collapsed-menu" : ""];
    }

    setTitle() {
        this.title = this.$route.meta.title || '';
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
                    <div class="layout-header-right">
                        {this.$store.state.user ?
                            <span>{this.$store.state.user.nickname}</span> :
                            [
                                <Button type="primary" on-click={() => {
                                    this.$store.commit('setUser', { nickname: 'test' });
                                }}>登录</Button>,
                                <Button>注册</Button>
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
                    <Content style={{ margin: "20px", minHeight: "260px", padding: '5px' }}>
                        <router-view></router-view>
                    </Content>
                </Layout>
            </Layout>
        );
    }
}
