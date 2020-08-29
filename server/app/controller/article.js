const BaseController = require('./base')
const marked = require('marked')

class ArticleController extends BaseController {
  async index(){
    const {ctx} = this
    const articles = await ctx.model.Article.find().populate('author').sort({ createdAt:-1})
    this.success(articles)
  }

  async create(){
    const {ctx} = this
    const {userid} = ctx.state
    const {content} = ctx.request.body
    const title = content.split('\n').find(v=>{
      return v.indexOf('# ')===0
    })

    const obj = {
      title: title.replace('# ', ''),
      article: content,
      article_html: marked(content),
      author: userid
    }

    const ret = await ctx.model.Article.create(obj)
    if (ret._id) {
      this.success({
        id: ret._id,
        title: ret.title
      })
    } else {
      this.error('创建失败')
    }
  }
}

module.exports = ArticleController
