<template>
  <div>
    <!-- <div contenteditable="true">哈哈</div>
    document.execCommand('')-->
    <!-- 1. 刚开始第三方的
    tinyMce，wangEditor-->
    <!-- 2. 开源的定制  slate.js  -->
    <!-- 3. 有专门的编辑器开发团队，自己定制把，非常复杂，word在线版
    计算位置，定位，样式，实现一个简单的浏览器工作量差不多的-->
    <div class="write-btn">
      <el-button @click="submit" type="primary">提交</el-button>
    </div>
    <el-row>
      <el-col :span="12">
        <!-- markdown编辑器的基本操作 -->
        <textarea ref="editor" class="md-editor" :value="content" @input="update"></textarea>
      </el-col>
      <el-col :span="12">
        <div class="markdown-body" v-html="compiledContent"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import marked from "marked";
import hijs from "highlight.js";
import javascript from "highlight.js/lib/languages/javascript";
import "highlight.js/styles/monokai-sublime.css";
import article from "../../../project-demo-master/server/app/model/article";
export default {
  data() {
    return {
      content: `# 每天最重要事
* 和妞妞玩
* 上课
* 吃饭
* 睡觉
* 学习
\`\`\`javascript
console.log(123)
\`\`\`
        `,
    };
  },
  computed: {
    compiledContent() {
      return marked(this.content, {});
    },
  },
  mounted() {
    this.timer = null;
    this.bindEvents();

    marked.setOptions({
      rendered: new marked.Renderer(),
      highlight(code) {
        return hijs.highlightAuto(code).value;
      },
    });
  },
  methods: {
    bindEvents() {
      this.$refs.editor.addEventListener("paste", async (e) => {
        const file = e.clipboardData.files;
        console.log(file);
        // 直接上传
      });

      this.$refs.editor.addEventListener("drop", async (e) => {
        const file = e.dataTransfer.files;
        console.log(file);
        // @todo
        // 文件上传
        e.preventDefault();
      });
    },
    update(e) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.content = e.target.value;
      }, 350);
    },
    async submit() {
      // user-> article 一对多
      // 文章列表点赞 关注 草稿
      
      let ret = await this.$http.post("/article/create", {
        content: this.content,
        compiledContent: this.compiledContent,
      });
    },
  },
};
</script>

<style scoped>
.md-editor {
  width: 100%;
  height: 100vh;
  outline: none;
}
.write-btn {
  position: fixed;
  z-index: 100;
  right: 30px;
  top: 10px;
}
</style>