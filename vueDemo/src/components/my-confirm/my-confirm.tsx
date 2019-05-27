import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { convClass } from '@/helpers';
import { Button, Row, Col } from '../iview';

type BtnType = {
    text: string;
    type?: string;
    loading?: boolean;
    onClick?: (ele: BtnType, idx: number) => any;
};
@Component
class MyConfirm extends Vue {
    @Prop()
    title?: string;

    @Prop({ default: false })
    loading: boolean;

    @Prop()
    btnList?: BtnType[];

    @Prop()
    ok?: (ele: BtnType) => void;

    @Prop()
    cancel?: (ele: BtnType) => void;

    private get innerBtnList() {
        return this.btnList || [{
            loading: false,
            text: '取消',
            onClick: (e) => {
                this.cancel && this.cancel(e);
            }
        }, {
            text: '确认',
            type: 'primary',
            onClick: async (e, idx) => {
                if (this.ok) {
                    if (this.loading) {
                        e.loading = true;
                        this.$forceUpdate();
                    }
                    await this.ok(e);
                    if (this.loading) {
                        e.loading = false;
                        this.$forceUpdate();
                    }
                }
            }
        }];
    };

    renderBtn() {
        let btnList = this.innerBtnList;

        return (
            <Row gutter={5} type="flex" justify="end">
                {btnList.map((ele, idx) => {
                    if (!ele.loading)
                        ele.loading = false;
                    return (
                        <Col>
                            <Button type={ele.type as any} on-click={() => {
                                ele.onClick && ele.onClick(ele, idx);
                            }} loading={ele.loading}>{ele.text}</Button>
                        </Col>
                    );
                })}
            </Row>
        );
    }
    render() {
        return (
            <div>
                <h2>{this.title || ''}</h2>
                <div style={{ minHeight: '80px', marginTop: '10px' }}>
                    {this.$slots.default}
                </div>
                {this.renderBtn()}
            </div>
        );
    }
}

const MyConfirmView = convClass<MyConfirm>(MyConfirm);
export default MyConfirmView;