<script lang="ts"></script>

<script setup lang="ts">
import TitleBar from '@comp/TitleBar/TitleBar.vue'
</script>

<template>
  <div>
    <TitleBar title="[标签页name]" :showMenu="false" />
    <main class="container">main-viewport-only</main>
  </div>
</template>
