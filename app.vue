<template>
  <UApp>
    <div
      class="min-h-screen bg-primary flex flex-col items-center justify-center"
    >
      <div class="h-screen lg:p-46 p-4 pb-16"><Subscribe /></div>

      <Roadmap class="w-full flex flex-col items-center pb-32" />
      <Footer class="p-8" />
    </div>
  </UApp>
</template>

<script setup lang="ts">
useHead({
  title: "STORMY - Alceva",
});
</script>
