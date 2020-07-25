<template>
  <div>
    <h1>用户中心</h1>
    <div ref="drag" id="drag">
      <input type="file" name="file" @change="handleFileChange" />
    </div>

    <div>
      <el-progress :stroke-width="20" :text-inside="true" :percentage="uploadProgress"></el-progress>
    </div>
    <div>
      <el-button @click="uploadFile">上传</el-button>
    </div>
    <div>
      <p>计算hash的进度</p>
      <el-progress :stroke-width="20" :text-inside="true" :percentage="hashProgress"></el-progress>
    </div>
  </div>
</template>

<script>
import sparkMD5 from "spark-md5";

const CHUNK_SIZE = 0.1 * 1024 * 1024;
export default {
  async mounted() {
    const ret = await this.$http.get("/user/info");
    this.bindEvents();
  },
  data() {
    return {
      file: null,
      uploadProgress: 0,
      hashProgress: 0,
      chunks: [],
    };
  },
  methods: {
    bindEvents() {
      const drag = this.$refs.drag;
      drag.addEventListener("dragover", (e) => {
        drag.style.borderColor = "red";
        e.preventDefault();
      });
      drag.addEventListener("dragleave", (e) => {
        drag.style.borderColor = "green";
        e.preventDefault();
      });
      drag.addEventListener("drop", (e) => {
        // cnostc/$http
        const fileList = e.dataTransfer.files;
        drag.style.borderColor = "#eee";
        this.file = fileList[0];
        e.preventDefault();
      });
    },
    handleFileChange(e) {
      const [file] = e.target.files;
      if (!file) {
        return;
      }
      this.file = file;
    },
    async blobToString(blob) {
      // blob是文件
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function () {
          const ret = reader.result
            .split("")
            .map((v) => v.charCodeAt())
            .map((v) => v.toString(16).toUpperCase())
            .map((v) => v.padStart(2, "0"))
            .join(" ");
          resolve(ret);
        };
        reader.readAsBinaryString(blob);
      });
    },
    async isGif(file) {
      // GIF89a GIF87a
      // 前面6个16进制 '47 49 46 38 39 61' '47 49 46 38 37 61'
      // 16进制的转换
      const ret = await this.blobToString(file.slice(0, 6));
      const isGif = ret === "47 49 46 38 39 61" || ret === "47 49 46 38 37 61";
      return isGif;
    },
    async isPng(file) {
      const ret = await this.blobToString(file.slice(0, 8));
      const ispng = ret === "89 50 4E 47 0D 0A 1A 0A";
      return ispng;
    },
    async isJpg(file) {
      const len = file.length;
      const start = await this.blobToString(file.slice(0, 2));
      const tail = await this.blobToString(file.slice(-2, len));
      const ispng = start === "FF D8" && tail === "FF D9";
      return ispng;
    },
    async isImage(file) {
      // 通过文件流判断 是否为图片
      // 先判定jif
      const isimg =
        (await this.isGif(file)) ||
        (await this.isPng(file)) ||
        (await this.isJpg(file));
      return isimg;
    },
    createFileChunk(file, size = CHUNK_SIZE) {
      const chunks = [];
      let cur = 0;
      while (cur < this.file.size) {
        chunks.push({ index: cur, file: file.slice(cur, cur + size) });
        cur += size;
      }
      return chunks;
    },
    async calculateHashWorker() {
      return new Promise((resolve) => {
        this.worker = new Worker("/hash.js");
        this.worker.postMessage({ chunks: this.chunks });
        this.worker.onmessage = (e) => {
          const { progress, hash } = e.data;
          this.hashProgress = Number(progress.toFixed(2));
          if (hash) {
            resolve(hash);
          }
        };
      });
    },
    async calculateHashIdle() {
      const chunks = this.chunks;
      return new Promise((resolve) => {
        const spark = new sparkMD5.ArrayBuffer();
        let count = 0;

        const appendToSpark = async (file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = (e) => {
              spark.append(e.target.result);
              resolve();
            };
          });
        };
        const workLoop = async (deadline) => {
          while (count < chunks.length && deadline.timeRemaining() > 1) {
            // 空闲时间 且有任务
            await appendToSpark(chunks[count].file);
            count++;
            if (count < chunks.length) {
              this.hashProgress = Number((100 * count) / chunks.length).toFixed(
                2
              );
            } else {
              this.hashProgress = 100;
              resolve(spark.end());
            }
          }
          window.requestIdleCallback(workLoop);
        };
        window.requestIdleCallback(workLoop);
      });
    },
    async uploadFile() {
      // if (!await this.isImage(this.file)) {
      //   console.log('文件格式不对')
      //   return
      // }else{
      //   console.log('格式正确');
      // }
      this.chunks = this.createFileChunk(this.file);
      const hash = await this.calculateHashWorker();
      const hash1 = await this.calculateHashIdle();
      console.log("文件hash", hash);
      console.log("文件hash1", hash1);

      // 抽样hash 不算全量
      // 布隆过滤器 损失一小部分的精度 换取效率
      
      return;
      const form = new FormData();
      form.append("name", "file");
      form.append("file", this.file);
      const ret = this.$http.post("/uploadfile", form, {
        onUploadProgress: (progress) => {
          this.uploadProgress = Number(
            (progress.loaded / progress.total) * 100
          ).toFixed(2);
        },
      });
    },
  },
};
</script>

<style lang="stylus" scoped>
#drag {
  height: 100px;
  border: 2px dashed green;
  text-align: center;
  line-height: 100px;
  vertical-align: middle;

  &:hover {
    border-color: red;
  }
}
</style>