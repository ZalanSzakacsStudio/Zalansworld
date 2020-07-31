<template>
  <div id="app">
    <Viewer/>
  </div>
</template>

<script>
const Viewer = () => import('../components/Viewer.vue');

export default {
  components: {
    Viewer
  }
};
</script>

<style lang="scss">
html,
body,
#app {
  height: 100%;
  padding: 0;
  margin: 0;
}
</style>
