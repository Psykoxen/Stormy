<template>
  <div
    class="flex flex-row items-start justify-between w-[calc(100%-4rem)] gap-4"
  >
    <!-- Liste des alertes -->
    <div
      class="flex flex-col items-center justify-between bg-[#323e50] w-2/3 text-white rounded-sm px-3"
    >
      <div
        v-for="value in filteredAlerts"
        :key="value.id"
        class="bg-[#394452] w-full p-3 my-2 rounded opacity-90"
        :style="{
          backgroundColor: colorMap[value.timelaps[0]?.color_id] || '#394452',
        }"
      >
        <p>{{ value.code }} - {{ value.name }}</p>
        <p>{{ value.phenom_id }}</p>
        <p>
          {{
            value.timelaps
              .map((t) => `${t.color_id} - ${t.begin_time} - ${t.end_time}`)
              .join(", ")
          }}
        </p>
      </div>
    </div>

    <!-- Filtres -->
    <div
      class="flex flex-col items-center justify-between bg-[#323e50] w-1/3 text-white rounded-sm px-3"
    >
      <UButton
        icon="i-lucide-wind"
        class="w-full mt-2"
        :variant="selectedPhenom === 'VENT' ? 'solid' : 'outline'"
        @click="toggleFilter('VENT')"
      >
        Vent
      </UButton>

      <UButton
        icon="i-lucide-cloud-rain-wind"
        class="w-full mt-2"
        :variant="selectedPhenom === 'PLUIE-INONDATION' ? 'solid' : 'outline'"
        @click="toggleFilter('PLUIE-INONDATION')"
      >
        Pluie - Inondation
      </UButton>

      <UButton
        icon="i-lucide-zap"
        class="w-full mt-2"
        :variant="selectedPhenom === 'ORAGES' ? 'solid' : 'outline'"
        @click="toggleFilter('ORAGES')"
      >
        Orages
      </UButton>

      <UButton
        icon="i-lucide-cloud-snow"
        class="w-full mt-2"
        :variant="selectedPhenom === 'NEIGE-VERGLAS' ? 'solid' : 'outline'"
        @click="toggleFilter('NEIGE-VERGLAS')"
      >
        Neige - Verglas
      </UButton>

      <UButton
        icon="i-lucide-thermometer-sun"
        class="w-full mt-2"
        :variant="selectedPhenom === 'CANICULE' ? 'solid' : 'outline'"
        @click="toggleFilter('CANICULE')"
      >
        Canicule
      </UButton>

      <UButton
        icon="i-lucide-thermometer-snowflake"
        class="w-full mt-2"
        :variant="selectedPhenom === 'GRAND FROID' ? 'solid' : 'outline'"
        @click="toggleFilter('GRAND FROID')"
      >
        Grand Froid
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const { data: alerts } = await useFetch("/api/weather/alerts");

// Dictionnaire des couleurs
const colorMap: Record<number, string> = {
  1: "#25d366",
  2: "#ffc546",
  3: "#fe9a00",
  4: "#de161d",
};

// Filtre actif
const selectedPhenom = ref<string | null>(null);

// Fonction pour (dés)activer le filtre
function toggleFilter(phenom: string) {
  selectedPhenom.value = selectedPhenom.value === phenom ? null : phenom;
}

// Liste filtrée des alertes
const filteredAlerts = computed(() => {
  if (!alerts.value) return [];
  if (!selectedPhenom.value) return alerts.value;
  return alerts.value.filter(
    (a: any) => a.phenom_id?.toUpperCase() === selectedPhenom.value
  );
});
</script>
