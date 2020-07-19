<template>
  <div>
    <h1>用户中心</h1>
    <div ref="drag" id="drag">
      <input type="file" name="file" @change="handleFileChange">
    </div>

    <div>
      <el-progress :stroke-width='20' :text-inside="true" :percentage="uploadProgress"></el-progress>
    </div>
    <div>
      <el-button @click="uploadFile">上传</el-button>
    </div>
  </div>
</template>

<script>
  export default {
    async mounted () {
      const ret = await this.$http.get('/user/info');
      console.log(ret);

      this.bindEvents()
    },
    data() {
      return {
        file: null,
        uploadProgress:0
      }
    },
    methods: {
      bindEvents(){
        const drag = this.$refs.drag
        drag.addEventListener('dragover',e=>{
          drag.style.borderColor = 'red'
          e.preventDefault()
        })
        drag.addEventListener('dragleave',e=>{
          drag.style.borderColor = 'green'
          e.preventDefault()
        })
        drag.addEventListener('drop',e=>{
          // cnostc/$http
          const fileList = e.dataTransfer.files
          drag.style.borderColor = '#eee'
          this.file = fileList[0]
          e.preventDefault()
        })
      },
      handleFileChange(e) {
        console.log(e);
        const [file] = e.target.files
        if (!file) {
          return 
        }
        this.file = file
      },
      async uploadFile(){
        const form = new FormData()
        form.append('name','file')
        form.append('file',this.file)
        const ret = this.$http.post('/uploadfile',form,{
          onUploadProgress: progress=>{
            this.uploadProgress = Number((progress.loaded/progress.total)*100).toFixed(2)
          }
        })
        console.log(ret);
      }
    },
  }
</script>

<style lang="stylus" scoped>
#drag
  height 100px
  border 2px dashed green
  text-align center
  line-height 100px
  vertical-align middle
  &:hover
    border-color red
</style>