<template>
  <div class="h-screen bg-parchment text-ink font-serif relative flex justify-center overflow-hidden selection:bg-cinnabar selection:text-white">
    <div class="absolute inset-0 pointer-events-none bg-paper-texture mix-blend-multiply opacity-60 z-0"></div>
    <div class="w-full max-w-[480px] h-full relative z-10 shadow-2xl flex flex-col bg-parchment/50 backdrop-blur-[1px]">
      <main class="flex-1 overflow-hidden">
        <slot />
      </main>
    </div>
  </div>
</template>

