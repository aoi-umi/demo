import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import {
    Button, Drawer,
    Menu, MenuItem, Submenu, MenuGroup,
    Icon,
} from './components/iview';

@Component
export default class App extends Vue {
    drawerOpen = false;
    theme1 = 'light' as any;
    renderTopNav() {
        return (
            <div>
                <Menu mode="horizontal" theme={this.theme1} active-name="1">
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
            </div >
        );
    }
    render() {
        return (
            <div id="app">
                {this.renderTopNav()}
                <div>
                    <Button onClick={() => { this.drawerOpen = !this.drawerOpen }} type="primary">Open</Button>
                    <Drawer title="Basic Drawer" placement="left" closable={false} value={this.drawerOpen}>
                        <p>Some contents...</p>
                        <p>Some contents...</p>
                        <p>Some contents...</p>
                    </Drawer>
                </div >
                <div id="nav">
                    <router-link to="/">Home</router-link> |
                    <router-link to="/about">About</router-link>
                </div>
                <router-view />
            </div >
        );
    }
}
