'use strict'
const md5 = require('md5')
const jwt = require('jsonwebtoken')
const BaseController = require('./base')

const HashSalt = 'zxlisperfect'

const createRule = {
  email: { type: 'email' },
  nickname: { type: 'string' },
  passwd: { type: 'string' },
  captcha: { type: 'string' },
}
class UserController extends BaseController {
  async login() {
    const { ctx } = this
    const { app } = ctx
    const { email, passwd, captcha, emailcode } = ctx.request.body
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('验证码错误')
    }
    // if (emailcode !== ctx.session.emailcode) {
    //   return this.error('邮箱验证码错误')
    // }
    const user = await ctx.model.User.findOne({
      email,
      passwd: md5(passwd + HashSalt),
    })
    if (!user) {
      return this.error('用户名密码错误')
    }
    // 加密用户信息 成token 返回
    const token = jwt.sign(
      {
        email,
        _id: user.id,
      },
      app.config.jwt.secret,
      {
        expiresIn: "2 days",
      }
    )
    this.success({ token, email, nickname: user.nickname })
  }
  async register() {
    const { ctx } = this
    try {
      // 校验传递的参数
      ctx.validate(createRule)
    } catch (err) {
      // console.log(err)
      return this.error('参数校验失败', -1, err.errors)
    }

    const { email, passwd, captcha, nickname } = ctx.request.body

    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('验证码错误')
    }

    if (await this.checkEmail(email)) {
      this.error('邮箱重复啦')
    } else {
      const ret = await ctx.model.User.create({
        email,
        passwd: md5(passwd + HashSalt),
        nickname,
      })
      if (ret) {
        this.success('注册成功')
      }
    }
    // this.success({ name: 'zxl' })
  }

  async checkEmail(email) {
    const user = await this.ctx.model.User.findOne({ email })
    return user
  }

  async verify() {
    // 校验用户名是否存在
  }
  async info() {
    const { ctx } = this
    // 还不知道是哪个邮件 从token读取
    // 有的接口从token中读取数据 有的不需要
    const { email } = ctx.state
    const user = await this.checkEmail(email)
    this.success(user)
  }

  async follow() {
    const { ctx } = this;

    const me = await ctx.model.User.findById(ctx.state.userid);
    const isFollow = !!me.following.find(
      (id) => id.toString() === ctx.params.id
    );
    if (!isFollow) {
      me.following.push(ctx.params.id);
      me.save();
      this.message("关注成功");
    }
  }

  async cancelFollow() {
    const { ctx } = this;
    const me = await ctx.model.User.findById(ctx.state.userid);
    // 把用户从我的following数组中删掉
    const index = me.following
      .map((id) => id.toString())
      .indexOf(ctx.params.id);
    if (index > -1) {
      me.following.splice(index, 1);
      me.save();
      this.message("取消成功");
    }
    // let isFollow = !!me.following.find(id=> id.toString()===ctx.params.id)
    // if(!isFollow){
    //   me.following.push(ctx.params.id)
    //   me.save()
    //   this.message('关注成功')
    // }
  }

  async isfollow() {
    const { ctx } = this;
    const me = await ctx.model.User.findById(ctx.state.userid);
    // 我的follow字段里，有没有传来的这个用户id
    const isFollow = !!me.following.find(
      (id) => id.toString() === ctx.params.id
    );
    this.success({ isFollow });
  }


  async articleStatus(){
    const {ctx} = this
    const me = await ctx.model.User.findById(ctx.state.userid)
    console.log(me);
  }

  async likeArticle() {
    const { ctx } = this;
    const me = await ctx.model.User.findById(ctx.state.userid);
    if (!me.likeArticle.find((id) => id.toString() === ctx.params.id)) {
      me.likeArticle.push(ctx.params.id);
      me.save();
      await ctx.model.Article.findByIdAndUpdate(ctx.params.id, {
        $inc: { like: 1 },
      });
      return this.message("点赞成功");
    }
  }

  async cancelLikeArticle() {
    const { ctx } = this;
    const me = await ctx.model.User.findById(ctx.state.userid);
    const index = me.likeArticle
      .map((id) => id.toString())
      .indexOf(ctx.params.id);
    if (index > -1) {
      me.likeArticle.splice(index, 1);
      me.save();
      await ctx.model.Article.findByIdAndUpdate(ctx.params.id, {
        $inc: { like: -1 },
      });
      return this.message("取消点赞成功");
    }
  }

}

module.exports = UserController
