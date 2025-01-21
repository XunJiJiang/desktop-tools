<script lang="ts"></script>

<script setup lang="ts">
import TitleBar from '@comp/TitleBar/TitleBar.vue'
</script>

<template>
  <div>
    <TitleBar title="[let:label]" :showMenu="false" />
    <main class="container">[let:label]</main>
  </div>
</template>
