<template>
  <button 
    class="relative overflow-hidden px-8 py-3 rounded-full font-serif font-bold tracking-widest transition-all duration-300 group"
    :class="[
      variant === 'primary' ? 'bg-gradient-to-r from-golden-flame/80 to-amber-600/80 text-void shadow-glow-gold' : 'bg-white/10 text-starlight hover:bg-white/20'
    ]"
  >
    <span class="relative z-10 flex items-center justify-center gap-2">
      <slot />
    </span>
    <div v-if="variant === 'primary'" class="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-500 blur-md"></div>
  </button>
</template>

<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary'].includes(value)
  }
})
</script>
