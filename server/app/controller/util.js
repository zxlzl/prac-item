'use strict'

const svgCaptcha = require('svg-captcha')
const BaseController = require('./base')
const fse = require('fs-extra')

class UtilController extends BaseController {
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
  async sendcode() {
    const { ctx } = this
    const email = ctx.query.email
    const code = Math.random().toString().slice(2, 6)
    console.log('邮箱:' + email + '验证码:' + code)
    ctx.session.emailcode = code

    const subject = '赵小莉学习得验证码'
    const text = ''
    const html = `<h2>测试验证码<a href=""><span>${code}</span></a></h2>`
    const hasSend = await this.service.tools.send(email, subject, text, html)
    if (hasSend) {
      this.message('发送成功')
    } else {
      this.error('发送失败')
    }
  }

  // 上传文件
  async uploadfile() {
    const { ctx } = this
    const file = ctx.request.files[0]
    console.log(file)
    const { name } = ctx.request.body

    // const targetDir = path.resolve()
    await fse.move(file.filepath, this.config.UPLOAD_DIR + '/' + file.filename)

    this.success({ url: `/public/${file.filename}` })
  }
}

module.exports = UtilController
