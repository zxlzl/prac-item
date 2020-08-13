const BaseController = require('./base')
const marked = require('marked')

class ArticleController extends BaseController {
  async index(){
    const {ctx} = this
    const articles = await ctx.model.articles.find().populate('author').sort({ createdAt:-1})
    this.success(articles)
  }
}