<template>
  <div>
    <el-form class="login-form" :rules="rules">
      <el-form-item prop="email">
        <span>
          <i class="el-icon-mobile"></i>
        </span>
        <el-input placeholder="邮箱"></el-input>
      </el-form-item>

      <el-form-item prop="passwd">
        <span>
          <i class="el-icon-lock"></i>
        </span>
        <el-input placeholder="密码"></el-input>
      </el-form-item>

      <el-form-item prop="captcha">
        <el-input placeholder="验证码"></el-input>
        <img @click="updateCaptcha" :src="captchaUrl" alt="">
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  layout: "login",
  data() {
    return {
      rules: [],
      captchaUrl: ''
    }
  },
  methods: {
    updateCaptcha() {
      this.captchaUrl = '/api/captcha?_t='+new Date().getTime()
    }
  },
  mounted () {
    this.updateCaptcha();
  },
};
</script>

<style lang="stylus">
.login-form {
  width: 800px;
  margin: 50px auto;
}
</style>