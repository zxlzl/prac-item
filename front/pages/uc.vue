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

    <div>
      <!-- chunk.progress
      如果progress = -1 或者 <0 报错 显示红色
      == 100 成功
      别的数字 方块高度显示-->
      <!-- 尽可能让方块看起来是正方体 -->
      <!-- 比如10个方块 4*4 9个 3*3 -->
      <div class="cube-container" :style="{width:cubeWidth+'px'}">
        <div class="cube" v-for="chunk in chunks" :key="chunk.name">
          <div
            :class="{
            'uploading':chunk.progress>0&&chunk.progress<100,
            'success':chunk.progress==100,
            'error':chunk.progress<0,
          }"
            :style="{height:chunk.progress+'%'}"
          >
            <i
              class="el-icon-loading"
              style="color:#f48f62"
              v-if="chunk.progress<100&&chunk.progress>0"
            ></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import sparkMD5 from "spark-md5";
import { resolve } from "url";

const CHUNK_SIZE = 1 * 1024 * 1024;
export default {
  async mounted() {
    const ret = await this.$http.get("/user/info");
    this.bindEvents();
  },
  data() {
    return {
      file: null,
      // uploadProgress: 0,
      hashProgress: 0,
      chunks: [],
    };
  },
  computed: {
    cubeWidth() {
      return Math.ceil(Math.sqrt(this.chunks.length)) * 16;
    },
    uploadProgress() {
      if (!this.file || this.chunks.length) {
        return 0;
      }
      const loaded = this.chunks
        .map((item) => item.chunk.size * item.progress)
        .reduce((acc, cur) => acc + cur, 0);
      return parseInt((loaded / this.file.size) * 100).toFixed(2);
    },
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
      console.log(chunks);
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
    async calculateHashSimple() {
      // 布隆过滤器 判断一个数据存在与否
      return new Promise((resolve) => {
        const spark = new sparkMD5.ArrayBuffer();
        const reader = new FileReader();

        const file = this.file;
        const size = file.size;
        const offset = 2 * 1024 * 1024;
        // 第一个区块也就是第一个2m 最后一个2m 数据全要 中间取前中后各两个字节
        let chunks = [file.slice(0, offset)];
        let cur = offset;
        while (cur < size) {
          if (cur + offset >= size) {
            chunks.push(file.slice(cur, cur + offset));
          } else {
            // 中间的区块
            const mid = cur + offset / 2;
            const end = cur + offset;
            chunks.push(file.slice(cur, cur + 2));
            chunks.push(file.slice(mid, mid + 2));
            chunks.push(file.slice(end - 2, end));
          }
          cur += offset;
        }
        reader.readAsArrayBuffer(new Blob(chunks));
        reader.onload = (e) => {
          spark.append(e.target.result);
          this.hashProgress = 100;
          resolve(spark.end());
        };
      });
    },
    async uploadFile() {
      // if (!await this.isImage(this.file)) {
      //   console.log('文件格式不对')
      //   return
      // }else{
      //   console.log('格式正确');
      // }
      const chunks = this.createFileChunk(this.file);
      // const hash = await this.calculateHashWorker();
      // const hash1 = await this.calculateHashIdle();
      const hash = await this.calculateHashSimple();
      this.hash = hash;

      // 问一下后端 文件是否上传过 如果没有 是否有存在的切片
      const {data:{uploaded, uploadedList}} = await this.$http.post('/checkfile',{
        hash: this.hash,
        ext: this.file.name.split('.').pop()
      })

      if (uploaded) {
        // 秒传
        return this.$message.success('秒传成功')
      }
      // console.log("文件hash", hash);
      // console.log("文件hash1", hash1);
      console.log("文件has2 simple hash", hash);
      this.chunks = chunks.map((chunk, index) => {
        // 切片名字 hash index
        const name = hash + "-" + index;
        return {
          hash,
          name,
          index,
          chunk: chunk.file,
          size: chunk.index,
          progress: 0,
        };
      });
      await this.uploadChunks();
    },
    async uploadChunks() {
      console.log(this.chunks);
      const request = this.chunks
        .map((item, i) => {
          const form = new FormData();
          const { chunk, hash, name, size } = item;
          form.append("chunk", chunk);
          form.append("hash", hash);
          form.append("name", name);
          form.append("size", size);
          // form.append('index',chunk.index)
          return form;
        })
        .map((form, index) =>
          this.$http.post("/uploadfile1", form, {
            onUploadProgress: (progress) => {
              // 不是整体的进度条 而是每个区块有自己的进度条 整体的需要计算
              this.chunks[index].progress = Number(
                (progress.loaded / progress.total) * 100
              ).toFixed(2);
            },
          })
        );
      // @todo 并发量控制
      await Promise.all(request);
      await this.mergeRequest()

      // const form = new FormData();
      // form.append("name", "file");
      // form.append("file", this.file);
      // console.log(this.file);
      // const ret = this.$http.post("/uploadfile", form, {
      //   onUploadProgress: (progress) => {
      //     this.uploadProgress = Number(
      //       (progress.loaded / progress.total) * 100
      //     ).toFixed(2);
      //   },
      // });
    },
    async mergeRequest(){
      this.$http.post('mergefile',{
        ext: this.file.name.split('.').pop(),
        size: CHUNK_SIZE,
        hash: this.hash
      })
    }
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
}

.cube-container {
  .cube {
    width: 16px;
    height: 16px;
    line-height: 12px;
    border: 1px black solid;
    box-sizing: border-box;
    background: #eeeeee;
    float: left;

    >.success {
      background: green;
    }

    >.uploading {
      background: blue;
    }

    >.error {
      background: red;
    }
  }
}
</style>