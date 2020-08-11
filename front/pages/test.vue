<template>
  <div
    class="notice"
    id="notice"
  >
    <ul
      class="notice-box"
      :style="{transform:transform}"
      :class="{unanim:num===0}"
    >
      <li
        class="item"
        v-for="(item,index) in notices"
        :key="index"
      >
        <span>{{item}}</span>
      </li>
      <li
        class="item"
        v-for="(item,index) in notices"
        :key="index+notices.length"
      >
        <span>{{item}}</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      notices: ['内容1', '内容2', '内容3',],
      num: 0
    }
  },
  computed: {
    transform: function () {
      return 'translateY(-' + this.num * 40 + 'px)'
    }
  },
  created: function () {
    setInterval(()=> {
      if (this.num !== this.notices.length) {
        this.num++
      } else {
        this.num = 0
      }
    }, 2000)
  }
};
</script>

<style scoped>
.notice{
    display: inline-block;
    position:relative;
    overflow: hidden;
    height: 40px;
  }
  .notice-box{
    transition: 1s linear;
  }
  .item {
    height: 40px;
    line-height: 40px;
  }
  .unanim{
    transition: none
  }
</style>