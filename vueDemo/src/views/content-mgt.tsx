import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { Tabs, TabPane } from '@/components/iview';
import { ArticleMgtView } from './article-mgt';

@Component
export default class ContentMgt extends Vue {
    render() {
        return (
            <div>
                <Tabs>
                    <TabPane label='文章管理'>
                    </TabPane>
                    <TabPane label='视频管理'></TabPane>
                </Tabs>
                <ArticleMgtView />
            </div>
        );
    }
}