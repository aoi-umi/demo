
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
          <Logo req="req prop" />
          <el-button type="danger">危险按钮</el-button>
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
