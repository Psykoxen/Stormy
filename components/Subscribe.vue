<template>
  <div
    class="bg-white opacity-95 w-full h-full rounded-lg flex lg:flex-row flex-col shadow-lg items-center"
  >
    <div class="lg:w-1/2 h-full flex items-center justify-center">
      <h2 class="lg:text-6xl text-4xl text-justify font-black m-6">
        Recevez les alertes météo et risques incendie directement par email,
        pour rester informé où que vous soyez !
      </h2>
    </div>
    <div class="lg:w-1/2 h-full flex items-center justify-center flex-col">
      <UForm
        class="bg-white p-8 lg:m-8 m-6 rounded-lg shadow-2xl/40 space-y-4 lg:w-2/3 h-3/4 flex flex-col"
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
import { departements } from "~/utils/departements";

const value = ref<string[]>([]);

const state = reactive({
  email: "",
  fireRisk: true,
  weatherAlert: false,
  departements: value,
});

const toast = useToast();

const items = ref(departements);

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

    toast.add({
      title: "Inscription réussie",
      description:
        "Vous serez alerté par email pour les départements sélectionnés.",
      icon: "i-lucide-check-circle",
    });
  } catch (error) {
    console.error(error);
    alert("Erreur lors de l'inscription");
  }
}
</script>
