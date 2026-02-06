<template>
  <div 
    class="glass-panel rounded-2xl p-6 transition-all duration-300"
    :class="{ 'glass-panel-hover': hover }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps({
  hover: {
    type: Boolean,
    default: false
  }
})
</script>
