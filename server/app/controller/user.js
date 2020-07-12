const BaseController = require('./base')

class UserController extends BaseController {
  async login() {

  }
  async register() {
    const {ctx} = this
    try{
      //校验传递的参数
      this.validate()
    }catch(err){
      return this.error('参数校验失败',-1,err.errors)
    }

  }

  async verify() {
    // 校验用户名是否存在

  }
  async info() {

  }
}

