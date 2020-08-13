<template>
  <div ref="list" class="infinite-list-container" @scroll="scrollEvent($event)">
    <div class="infinite-list-phantom" :style="{ height: listHeight + 'px' }"></div>
    <div class="infinite-list" :style="{ transform: getTransform }">
      <ArticleItem
        ref="items"
        class="infinite-list-item"
        :article="item"
        v-for="item in visibleData"
        :key="item._id"
        :style="{height: itemSize+'px'}"
      ></ArticleItem>
    </div>
  </div>
</template>

<script>
import ArticleItem from './ArticleItem'
export default {
  name: 'VirtualList',
  components: {
    ArticleItem,
  },
  props: {
    // 所有列表数据
    listData: {
      type: Array,
      default: () => [],
    },
    // 每项高度
    itemSize: {
      type: Number,
      default: 200,
    },
  },
  data() {
    return {
      // 可视区高度
      screenHeight: 800,
      // 偏移量
      startOffset: 0,
      // 起始索引
      start: 0,
      // 结束索引
      end: 4,
    };
  },
  computed: {
    // 列表总高度
    listHeight() {
      return this.listData.length * this.itemSize;
    },
    //可显示的列表项数
    visibleCount() {
      return Math.ceil(this.screenHeight / this.itemSize);
    },
    //获取真实显示列表数据
    visibleData() {
      console.log(this.listData, this.start, this.end);
      return this.listData.slice(
        this.start,
        Math.min(this.end, this.listData.length)
      );
    },
  },
  mounted() {
    this.end = this.start + this.visibleCount;
  },
  methods: {
    scrollEvent() {
      // 当前滚动位置
      let scrollTop = this.$refs.list.scrollTop;
      //此时的开始索引
      this.start = Math.floor(scrollTop / this.itemSize);
      //此时的结束索引
      this.end = this.start + this.visibleCount;
      //此时的偏移量
      this.startOffset = scrollTop - (scrollTop % this.itemSize);
    },
  },
};
</script>

<style scoped>
.infinite-list-container {
  height: 100%;
  overflow: auto;
  position: relative;
  -webkit-overflow-scrolling: touch;
}
.infinite-list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}
.infinite-list {
  left: 0;
  right: 0;
  top: 0;
  position: absolute;
}
</style>