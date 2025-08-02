<template>
  <h2 class="text-4xl font-extrabold mb-4 text-white align-left">
    PROJECT ROADMAP
  </h2>
  <UTimeline
    color="neutral"
    :default-value="0"
    :items="items"
    class="w-3/4 lg:w-96 lg:translate-x-[48%]"
    :ui="{
      indicator: 'bg-white',
      title: 'text-neutral-700',
      description: 'text-white/80',
      date: 'text-white/60',
      item: 'lg:even:flex-row-reverse lg:even:-translate-x-[calc(100%-2rem)] lg:even:text-right',
    }"
  />
</template>

<script setup lang="ts">
import type { TimelineItem } from "@nuxt/ui";

const items = ref<TimelineItem[]>([
  {
    date: "Juillet 2025",
    title: "Lancement du projet",
    description:
      "Réflexion initiale et définition des objectifs. Déploiement des premières fonctionnalités liées aux risques incendie.",
    icon: "i-lucide-rocket",
  },
  {
    date: "S2 2025",
    title: "Ajout de la vigilance météorologique",
    description:
      "Conception et développement de la fonctionnalité de vigilance météorologique. Intégration des alertes météo.",
    icon: "i-lucide-code-xml",
  },
]);
</script>
