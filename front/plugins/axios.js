import Vue from 'vue'
import axios from 'axios'

const service = axios.create({
  // timeout: 5,
  baseUrl: '/api'
})

// 请求拦截
// 主要做token的管理

// 响应拦截
Vue.prototype.$http = service

export const http = service