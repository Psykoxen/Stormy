<template>
  <div
    class="flex flex-col items-center justify-between bg-[#323e50] w-[calc(100%-4rem)] text-white rounded-sm px-3"
  >
    <div
      v-for="value in alerts"
      :key="value.id"
      class="bg-[#394452] w-full p-3 my-2 rounded border-2"
      :style="{
        borderColor: colorMap[value.timelaps[0]?.color_id] || '#394452',
      }"
    >
      <p>{{ value.code }} - {{ value.name }}</p>
      <p>{{ value.phenom_id }}</p>
      <!-- <p>
        {{
          value.timelaps
            .map((t) => `${t.color_id} - ${t.begin_time} - ${t.end_time}`)
            .join(", ")
        }}
      </p> -->
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: alerts, error, pending } = await useFetch("/api/weather/alerts");

const colorMap: Record<number, string> = {
  1: "#25d366",
  2: "#ffc546",
  3: "#fe9a00",
  4: "#de161d",
};
</script>
