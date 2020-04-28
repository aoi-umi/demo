
import Vue from "vue";
import { Component } from "vue-property-decorator";

import Logo from "~/components/Logo";

import './index.less';

@Component
export default class App extends Vue {
  render() {
    return (
      <div class="container">
        <div>
          <h1>Index 2</h1>
          <Logo req="req prop" />
        </div>
      </div>
    );
  }
}
