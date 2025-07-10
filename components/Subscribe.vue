<template>
  <div class="bg-white opacity-95 w-full h-full rounded-lg flex shadow-lg">
    <div class="w-1/2 h-full flex items-center justify-center">
      <h2 class="text-6xl font-black m-6">
        Recevez les alertes météo et incendie directement par email, pour rester
        informé au bon moment, où que vous soyez !
      </h2>
    </div>
    <div class="w-1/2 h-full flex items-center justify-center flex-col">
      <UForm
        class="bg-white p-8 m-8 rounded-lg shadow-2xl/40 space-y-4 w-2/3 h-3/4 flex flex-col"
        :state="state"
        @submit="onSubmit"
      >
        <h1 class="text-2xl font-bold mb-4">SOYEZ NOTIFIÉ EN TEMPS RÉEL</h1>
        <UInput
          v-model="state.email"
          class=""
          name="email"
          placeholder="Adresse email"
          trailing-icon="i-lucide-at-sign"
          required
        />
        <USelectMenu
          v-model="value"
          value-key="value"
          multiple
          name="departements"
          :items="items"
          required
          placeholder="Sélectionnez vos départements"
        />

        <USwitch label="Risque incendie" name="fire-risk" default-value />
        <USwitch
          disabled
          label="Vigilance météorologique"
          description="Disponible prochainement"
        />
        <div class="flex justify-center">
          <UButton type="submit" class="w-content text-center">
            Être Alerter !
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
const value = ref<string[]>([]);

const state = reactive({
  email: "",
  fireRisk: true,
  weatherAlert: false,
  departements: value,
});

const items = ref([
  { label: "01 - Ain", value: "01" },
  { label: "02 - Aisne", value: "02" },
  { label: "03 - Allier", value: "03" },
  { label: "04 - Alpes-de-Haute-Provence", value: "04" },
  { label: "05 - Hautes-Alpes", value: "05" },
  { label: "06 - Alpes-Maritimes", value: "06" },
  { label: "07 - Ardèche", value: "07" },
  { label: "08 - Ardennes", value: "08" },
  { label: "09 - Ariège", value: "09" },
  { label: "10 - Aube", value: "10" },
  { label: "11 - Aude", value: "11" },
  { label: "12 - Aveyron", value: "12" },
  { label: "13 - Bouches-du-Rhône", value: "13" },
  { label: "14 - Calvados", value: "14" },
  { label: "15 - Cantal", value: "15" },
  { label: "16 - Charente", value: "16" },
  { label: "17 - Charente-Maritime", value: "17" },
  { label: "18 - Cher", value: "18" },
  { label: "19 - Corrèze", value: "19" },
  { label: "2A - Corse-du-Sud", value: "2A" },
  { label: "2B - Haute-Corse", value: "2B" },
  { label: "21 - Côte-d'Or", value: "21" },
  { label: "22 - Côtes-d'Armor", value: "22" },
  { label: "23 - Creuse", value: "23" },
  { label: "24 - Dordogne", value: "24" },
  { label: "25 - Doubs", value: "25" },
  { label: "26 - Drôme", value: "26" },
  { label: "27 - Eure", value: "27" },
  { label: "28 - Eure-et-Loir", value: "28" },
  { label: "29 - Finistère", value: "29" },
  { label: "30 - Gard", value: "30" },
  { label: "31 - Haute-Garonne", value: "31" },
  { label: "32 - Gers", value: "32" },
  { label: "33 - Gironde", value: "33" },
  { label: "34 - Hérault", value: "34" },
  { label: "35 - Ille-et-Vilaine", value: "35" },
  { label: "36 - Indre", value: "36" },
  { label: "37 - Indre-et-Loire", value: "37" },
  { label: "38 - Isère", value: "38" },
  { label: "39 - Jura", value: "39" },
  { label: "40 - Landes", value: "40" },
  { label: "41 - Loir-et-Cher", value: "41" },
  { label: "42 - Loire", value: "42" },
  { label: "43 - Haute-Loire", value: "43" },
  { label: "44 - Loire-Atlantique", value: "44" },
  { label: "45 - Loiret", value: "45" },
  { label: "46 - Lot", value: "46" },
  { label: "47 - Lot-et-Garonne", value: "47" },
  { label: "48 - Lozère", value: "48" },
  { label: "49 - Maine-et-Loire", value: "49" },
  { label: "50 - Manche", value: "50" },
  { label: "51 - Marne", value: "51" },
  { label: "52 - Haute-Marne", value: "52" },
  { label: "53 - Mayenne", value: "53" },
  { label: "54 - Meurthe-et-Moselle", value: "54" },
  { label: "55 - Meuse", value: "55" },
  { label: "56 - Morbihan", value: "56" },
  { label: "57 - Moselle", value: "57" },
  { label: "58 - Nièvre", value: "58" },
  { label: "59 - Nord", value: "59" },
  { label: "60 - Oise", value: "60" },
  { label: "61 - Orne", value: "61" },
  { label: "62 - Pas-de-Calais", value: "62" },
  { label: "63 - Puy-de-Dôme", value: "63" },
  { label: "64 - Pyrénées-Atlantiques", value: "64" },
  { label: "65 - Hautes-Pyrénées", value: "65" },
  { label: "66 - Pyrénées-Orientales", value: "66" },
  { label: "67 - Bas-Rhin", value: "67" },
  { label: "68 - Haut-Rhin", value: "68" },
  { label: "69 - Rhône", value: "69" },
  { label: "70 - Haute-Saône", value: "70" },
  { label: "71 - Saône-et-Loire", value: "71" },
  { label: "72 - Sarthe", value: "72" },
  { label: "73 - Savoie", value: "73" },
  { label: "74 - Haute-Savoie", value: "74" },
  { label: "75 - Paris", value: "75" },
  { label: "76 - Seine-Maritime", value: "76" },
  { label: "77 - Seine-et-Marne", value: "77" },
  { label: "78 - Yvelines", value: "78" },
  { label: "79 - Deux-Sèvres", value: "79" },
  { label: "80 - Somme", value: "80" },
  { label: "81 - Tarn", value: "81" },
  { label: "82 - Tarn-et-Garonne", value: "82" },
  { label: "83 - Var", value: "83" },
  { label: "84 - Vaucluse", value: "84" },
  { label: "85 - Vendée", value: "85" },
  { label: "86 - Vienne", value: "86" },
  { label: "87 - Haute-Vienne", value: "87" },
  { label: "88 - Vosges", value: "88" },
  { label: "89 - Yonne", value: "89" },
  { label: "90 - Territoire de Belfort", value: "90" },
  { label: "91 - Essonne", value: "91" },
  { label: "92 - Hauts-de-Seine", value: "92" },
  { label: "93 - Seine-Saint-Denis", value: "93" },
  { label: "94 - Val-de-Marne", value: "94" },
  { label: "95 - Val-d'Oise", value: "95" },
]);

async function onSubmit(event: FormSubmitEvent<typeof state>) {
  event.preventDefault();

  try {
    const response = await $fetch("/api/alerts/subscribe", {
      method: "POST",
      body: {
        email: state.email,
        dept_code: state.departements,
        fire_alerts: state.fireRisk,
        warning_alerts: state.weatherAlert,
      },
    });
  } catch (error) {
    console.error(error);
    alert("Erreur lors de l'inscription");
  }
}
</script>
