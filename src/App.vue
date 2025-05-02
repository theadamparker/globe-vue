<script setup>
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
import Globe from './components/Globe.vue'
</script>

<template>
  <main>
    <Globe />
  </main>
</template>

<style>
:root {
  --Dark-Green: #2d6954;
}
body {
  background: var(--Dark-Green, #2d6954);
}
</style>
