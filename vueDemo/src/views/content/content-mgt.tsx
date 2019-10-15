import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { myEnum } from '@/config';
import { Tabs, TabPane } from '@/components/iview';
import ArticleMgt, { ArticleMgtView } from './article-mgt';

@Component
export default class ContentMgt extends Vue {
    $refs: { articleMgt: ArticleMgt }
    tab = '';
    mounted() {
        this.load();
    }

    @Watch('$route')
    route(to, from) {
        this.load();
    }

    async load() {
        let query = this.$route.query as any;
        if (myEnum.contentMgtType.getAllValue().includes(query.tab)) {
            this.tab = query.tab;
        }
        this.changeTab();
    }
    
    private tabLoaded = {
        article: false,
        video: false,
    };

    private changeTab() {
        let tab = parseInt(this.tab);
        if ((tab === myEnum.contentMgtType.文章 || !tab) && !this.tabLoaded.article) {
            this.$refs.articleMgt.query();
            this.tabLoaded.article = true;
        } else if (tab === myEnum.contentMgtType.视频 && !this.tabLoaded.video) {
        }
    }

    render() {
        return (
            <div>
                <Tabs v-model={this.tab} animated={false} on-on-click={(name: string) => {
                    this.$router.push({
                        path: this.$route.path,
                        query: {
                            ...this.$route.query,
                            tab: name
                        }
                    });
                }}>
                    <TabPane name={myEnum.contentMgtType.文章.toString()} label='文章管理'>
                        <ArticleMgtView ref='articleMgt' notQueryOnMounted notQueryOnRoute notQueryToRoute />
                    </TabPane>
                    <TabPane label='视频管理'></TabPane>
                </Tabs>
            </div>
        );
    }
}