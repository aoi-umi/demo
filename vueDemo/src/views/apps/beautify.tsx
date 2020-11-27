import { Component, Vue, Watch } from 'vue-property-decorator'
import { Card, Row, Col, Form, FormItem, Input, Button } from '@/components/iview'
import { routerConfig } from '@/router'
import * as parseJson from 'parse-json'

import { Base } from '../base'
import './beautify.less'

@Component
export default class Apps extends Base {
  stylePrefix = 'beautify-';
  input = '';
  output = '';
  mounted () {
  }
  render () {
    return (
      <Row gutter={10}>
        <Col xs={24} sm={12}>
          <Input v-model={this.input} class={this.getStyleName('input')} type='textarea' size='large' />
          <div class={this.getStyleName('op')} on-click={this.beautify}>
            <Button>校验</Button>
          </div>
        </Col>
        <Col xs={24} sm={12}>
          <pre class={this.getStyleName('output')} >
            {this.output}
          </pre>
        </Col>
      </Row>
    )
  }
  beautify () {
    if (this.input) {
      try {
        this.output = JSON.stringify(parseJson(this.input), null, '  ')
      } catch (e) {
        this.output = e.message
      }
    }
  }
}
