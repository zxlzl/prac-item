<template>
  <div>
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
import hijs from "highlight.js"
import javascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/monokai-sublime.css'
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

    marked.setOpion
  },
  methods: {
    bindEvents() {
      this.$refs.editor.addEventListener("paste", async (e) => {
        const file = e.clipboardData.files;
        console.log(file);
        // 直接上传
      });

      this.$refs.editor.addEventListener("drop", async (e) => {
        const file = e.dataTransfer.files
        console.log(file);
        // @todo
        // 文件上传
        e.preventDefault()
      });
    },
    update(e) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.content = e.target.value;
      }, 350);
    },
    submit() {},
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