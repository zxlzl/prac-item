'use strict'

const svgCaptcha = require('svg-captcha')
const Controller = require('egg').Controller

class UtilController extends Controller {
  async captcha() {
    const captcha = svgCaptcha.create({
      size: 4,
      width: 100,
      fontSize: 50,
      height: 40,
      noise: 3,
    })

    this.ctx.session.captcha = captcha.text

    this.ctx.response.type = 'image/svg+xml'

    this.ctx.body = captcha.data
    console.log('captcha=>', captcha.text)

  }
}

module.exports = UtilController
