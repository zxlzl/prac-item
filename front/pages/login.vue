<template>
  <div>
    <div class="login-container">
      <el-form
        class="login-form"
        label-width="100px"
        :model="form"
        :rules="rules"
        ref="loginForm"
      >
        <div class="title-container">
          <img src="/logo.png" alt />
        </div>

        <el-form-item prop="email" label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>

        <el-form-item prop="captcha" label="验证码" class="captcha-container">
          <div class="captcha">
            <img :src="code.captcha" @click="resetCaptcha" alt />
          </div>
          <el-input v-model="form.captcha" placeholder="请输入验证码"></el-input>
        </el-form-item>

        <!-- <el-form-item prop="emailcode" label="验证码" class="captcha-container">
          <div class="captcha">
            <el-button :disabled="!!send.timer" @click="sendEmailCode" type="primary" >{{sendText}}</el-button>
          </div>
          <el-input v-model="form.emailcode" placeholder="请输入验证码"></el-input>
        </el-form-item> -->

        <el-form-item prop="passwd" label="密码">
          <el-input v-model="form.passwd" type="password"  placeholder="请输入密码"></el-input>
        </el-form-item>

        <el-form-item label="  ">
          <!-- <button @click.prevent></button> -->
          <el-button type="primary" @click.native.prevent="handleLoginr">登陆</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import md5 from "md5";
export default {
  layout: "login",
  methods: {
    handleLoginr() {
      this.$refs.loginForm.validate(async valid => {
        if (valid) {
          // TODO 发送登陆请求
          let obj = {
            email: this.form.email,
            passwd: md5(this.form.passwd),
            captcha: this.form.captcha,
            emailcode: this.form.emailcode,
          };
          console.log(obj)
          let ret = await this.$http.post("/user/login", obj);
          // code=0成功
          if (ret.code == 0) {
            // token存入 登陆成功 返回token
            this.$message.success("登陆成功")
            localStorage.setItem('token',ret.data.token)
            setTimeout(() => {
              this.$router.push("/");
            }, 500);
          } else {
          this.$message.error(ret.message);
          }
        } else {
          console.log("校验失败");
        }
      });
    },
    resetCaptcha() {
      this.code.captcha = "/api/captcha?_t" + new Date().getTime();
    },
    async sendEmailCode(){
      await this.$http.get('/sendcode?email='+this.form.email)
      this.send.timer = 10
      this.timer = setInterval(()=>{
        this.send.timer-=1
        if (this.send.timer===0) {
          clearInterval(this.timer)
        }
      },1000)
    },
  },
  computed: {
    sendText() {
      if (this.send.timer<=0) {
        return '发送'
      }
      return `${this.send.timer}秒后发送`
    }
  },
  data() {
    return {
      send: {
        timer:0
      },
      form: {
        email: "384542246@qq.com",
        passwd: "asd12345",
        captcha: "1",
        emailcode: "1"
      },
      rules: {
        email: [
          { required: true, message: "请输入邮箱" },
          { type: "email", message: "请输入正确邮箱格式" }
        ],
        captcha: [{ required: true, message: "请输入验证码" }],
        emailcode: [
          { required: true, message: "请输入邮箱验证码" },
        ],
        passwd: [
          {
            required: true,
            patter: /^[\w_-]{6,12}$/g,
            message: "请输入6-12位密码"
          }
        ],
      },
      code: {
        captcha: "/api/captcha"
      }
    };
  }
};
</script>

<style lang="stylus"></style>