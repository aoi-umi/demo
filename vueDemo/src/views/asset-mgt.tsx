import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import moment from 'moment';

import { convClass, convert } from '@/helpers';
import * as helpers from '@/helpers';
import { dev, myEnum } from '@/config';
import { testApi, testSocket } from '@/api';
import { Modal, Input, Form, FormItem, Button, Card, TabPane, Tabs, Time, Row, Col } from '@/components/iview';
import { Base } from './base';
import { MyList, IMyList } from '@/components/my-list';


@Component
export default class AssetMgt extends Base {
    render() {
        return (
            <Row gutter={5}>
                <Col xs={8}>
                    <Card nativeOn-click={() => {
                        this.$router.push(dev.routeConfig.assetMgtLog.path);
                    }}>资金记录</Card>
                </Col>
                <Col xs={8}>
                    <Card nativeOn-click={() => {
                        this.$router.push(dev.routeConfig.assetMgtNotify.path);
                    }}>回调通知</Card>
                </Col>
            </Row>
        );
    }
}

@Component
export class AssetMgtLog extends Base {
    $refs: { list: IMyList<any> };
    render() {
        return (
            <MyList ref="list" columns={[]} />
        );
    }
}

@Component
export class AssetMgtNotify extends Base {
    $refs: { list: IMyList<any> };
    render() {
        return (
            <MyList ref="list" columns={[]} />
        );
    }
}