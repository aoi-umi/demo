
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

import Logo from "~/components/Logo";

import './index.less';

@Component
export default class App extends Vue {
  @Prop()
  input: string;
  render() {
    return (
      <div class="container">
        <div>
          <Logo req="req prop" />
          <el-button type="danger">危险按钮</el-button>
          <el-form>
            <el-form-item>
              <el-input v-model={this.input} type="text" auto-complete="off" placeholder="账号"></el-input>
            </el-form-item>
          </el-form>
          <h1 class="title">nuxt</h1>
          <h2 class="subtitle">My funkadelic Nuxt.js project</h2>
          <div class="links">
            <a href="https://nuxtjs.org/" target="_blank" class="button--green">
              Documentation
            </a>
            <a href="https://github.com/nuxt/nuxt.js"
              target="_blank"
              class="button--grey"
            >
              GitHub
            </a>
            <nuxt-link to="/index2" class="button--grey">测试</nuxt-link>
          </div>
        </div>
      </div>
    );
  }
}
