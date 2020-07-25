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
import { resolve } from 'url';
  export default {
    async mounted () {
      const ret = await this.$http.get('/user/info');
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
        const [file] = e.target.files
        if (!file) {
          return 
        }
        this.file = file
      },
      async blobToString(blob){
        // blob是文件
        return new Promise(resolve=>{
          const reader = new FileReader()
          reader.onload = function(){
            console.log(reader.result)
            const ret = reader.result.split('')
                          .map(v=>v.charCodeAt())
                          .map(v=>v.toString(16).toUpperCase())
                          .map(v=>v.padStart(2,'0'))
                          .join(' ')
            resolve(ret)
          }
          reader.readAsBinaryString(blob)
        })
      },
      async isGif(file){
        // GIF89a GIF87a
        // 前面6个16进制 '47 49 46 38 39 61' '47 49 46 38 37 61'
        // 16进制的转换
        const ret = await this.blobToString(file.slice(0,6))
        const isGif = (ret ==='47 49 46 38 39 61')||(ret ==='47 49 46 38 37 61')
        return isGif
      },
      async isPng(file){
        const ret = await this.blobToString(file.slice(0,8))
        const ispng = (ret ==='89 50 4E 47 0D 0A 1A 0A')
        return ispng
      },
      async isJpg(file){
        const len = file.length
        const start = await this.blobToString(file.slice(0,2))
        const tail = await this.blobToString(file.slice(-2,len))
        const ispng = (start === 'FF D8')&&(tail === 'FF D9')
        return ispng
      },
      async isImage(file){
        // 通过文件流判断 是否为图片
        // 先判定jif
        const isimg = await this.isGif(file) || await this.isPng(file) || await this.isJpg(file)
        return isimg
      },
      
      async uploadFile(){
        if (!await this.isImage(this.file)) {
          console.log('文件格式不对')
          return
        }else{
          console.log('格式正确');
        }
        const form = new FormData()
        form.append('name','file')
        form.append('file',this.file)
        const ret = this.$http.post('/uploadfile',form,{
          onUploadProgress: progress=>{
            this.uploadProgress = Number((progress.loaded/progress.total)*100).toFixed(2)
          }
        })
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