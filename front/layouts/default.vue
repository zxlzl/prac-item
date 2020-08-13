<template>
  <el-container>
    <el-header>
      <el-menu class mode="horizontal">
        <el-menu-item index="0">
          <img class="logo" src="/logo.png" alt />
        </el-menu-item>

        <el-menu-item index="1">
          <nuxt-link to="/">首页</nuxt-link>
        </el-menu-item>

        <el-menu-item v-if="userInfo.id">
          <a @click="logout">退出</a>
        </el-menu-item>

        <el-menu-item>
          <a href>{{userInfo.nickname}}</a>
        </el-menu-item>

        <el-menu-item v-if="userInfo.id">
          <nuxt-link to="/editor/new">写文章</nuxt-link>
        </el-menu-item>

        <el-menu-item v-if="userInfo.id">
          <nuxt-link to="/editor/new">注册</nuxt-link>
        </el-menu-item>

        <el-menu-item v-if="userInfo.id">
          <nuxt-link to="/editor/new">登录</nuxt-link>
        </el-menu-item>
      </el-menu>
    </el-header>
    <el-mail></el-mail>

    <nuxt></nuxt>

    <el-footer>底部信息</el-footer>
  </el-container>
</template>

<script>
export default {
  mounted() {
    this.getUserInfo();
    console.log(this.$store.state);
  },
  computed: {
    userInfo() {
      return this.$store.state.user;
    },
  },
  methods: {
    getUserInfo() {
      let token = localStorage.getItem("token");
      if (token) {
        this.$store.dispatch('user/detail')
      }
    },
  },
};
</script>

<style>
html {
  font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

.logo {
  width: 100px;
  height:50px;
}

.button--green {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #3b8070;
  color: #3b8070;
  text-decoration: none;
  padding: 10px 30px;
}

.button--green:hover {
  color: #fff;
  background-color: #3b8070;
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}
</style>
