<script setup>
import TheGlobe from './TheGlobe.vue'
</script>
<template>
  <div class="section section__hero">
    <div class="heroTitle">
      <div class="heroTitle__left">If everything <br>is connected</div>
      <div class="heroTitle__right">everything <br>is important</div>
    </div>
    <TheGlobe />
  </div>
</template>
<style scoped lang="scss">
.heroTitle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 4em;
  font-weight: bold;
  margin-top: 1em;
  line-height: 1;
  color: white;
  width: 100%;

  &__left {
    text-align: left;
  }

  &__right {
    text-align: right;
  }
}

.section__hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>