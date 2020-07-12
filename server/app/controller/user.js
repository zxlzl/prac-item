'use strict'

const BaseController = require('./base')

const createRule = {
  email: { type: 'email' },
  nickname: { type: 'string' },
  passwd: { type: 'string' },
  captcha: { type: 'string' },
}

class UserController extends BaseController {
  // async login() {}
  async register() {
    const { ctx } = this
    try {
      // 校验传递的参数
      ctx.validate(createRule)
    } catch (err) {
      return this.error('参数校验失败', -1, err.errors)
    }

    const { email, passwd, captcha, nickname } = ctx.request.body
    console.log({ email, passwd, captcha, nickname })
    if (captcha.toUpperCase() === ctx.session.captcha.toUpperCase()) {
      // 邮箱是否重复

    } else {
      this.error('验证码错误')
    }
    // this.success({ name: 'zxl' })
  }

  // async verify() {
  //   // 校验用户名是否存在
  // }
  // async info() {}
}

module.exports = UserController

