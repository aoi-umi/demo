import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import moment from 'moment';

import { testApi } from '@/api';
import { convClass, convert } from '@/helpers';
import { MyList, IMyList } from '@/components/my-list';
import { MyEditor } from '@/components/my-editor';
import { Divider, Button, Avatar } from '@/components/iview';
import { dev } from '@/config';
import { Base } from './base';
import { UserAvatarView } from './user-avatar';

@Component
class Comment extends Base {
    @Prop()
    ownerId: string;

    @Prop()
    type: number;

    $refs: { list: IMyList<any> };
    mounted() {
        this.query();
    }

    query(opt?) {
        this.$refs.list.query(opt);
    }

    submitLoading = false;
    comment = '';
    submit() {
        let comment = this.comment.trim();
        if (!comment)
            return this.$Message.warning('请输入评论');
        this.operateHandler('发送评论', async () => {
            this.submitLoading = true;
            let rs = await testApi.commentSubmit({ ownerId: this.ownerId, comment: this.comment, type: this.type });
            this.$refs.list.result.data.unshift(rs);
            this.comment = '';
        }).finally(() => {
            this.submitLoading = false;
        });
    }

    render() {
        return (
            <div>
                <MyEditor
                    class="comment-send"
                    toolbar={
                        [
                            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                            [{ 'font': [] }],
                            ['link']
                        ]
                    }
                    placeholder='请输入评论'
                    v-model={this.comment}
                />
                <div style={{ textAlign: 'right', marginTop: '5px' }}>
                    <Button on-click={() => {
                        this.query();
                    }} loading={this.submitLoading}>刷新评论</Button>
                    <Button type="primary" on-click={() => {
                        this.submit();
                    }}>发送评论</Button>
                </div>
                <Divider size='small' />
                <MyList
                    ref="list"
                    hideSearchBox
                    type="custom"

                    customRenderFn={(rs) => {
                        if (!rs.success || !rs.data.length) {
                            let msg = !rs.success ? rs.msg : '暂无评论';
                            return (
                                <div style={{ marginTop: '5px', textAlign: 'center' }}>{msg}</div>
                            );
                        }
                        return rs.data.map((ele) => {
                            return (
                                <div>
                                    <UserAvatarView user={ele.user} tipsPlacement="top-start" />
                                    <div style={{ marginLeft: '42px' }}>
                                        <p domPropsInnerHTML={ele.comment} />
                                        {moment(ele.createdAt).format(dev.dateFormat)}
                                    </div>
                                    <Divider size='small' />
                                </div>
                            );
                        });
                    }}

                    on-query={(t) => {
                        this.query(convert.Test.listModelToQuery(t));
                    }}

                    queryFn={async (data) => {
                        let rs = await testApi.commentQuery({
                            ...data,
                            ownerId: this.ownerId,
                            type: this.type,
                        });
                        return rs;
                    }}
                ></MyList>
            </div>
        );
    }
}

export const CommentView = convClass<Comment>(Comment);