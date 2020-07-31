<template>
  <div id="app">
    <audio
        id="stone"
        preload="auto"
        style="display: none"
    >
      <source
          src="assets/sounds/SlidingStoneLong.mp3"
          type="audio/mpeg"
      >
    </audio>
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
