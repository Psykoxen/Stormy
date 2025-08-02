<template>
  <div
    class="bg-white opacity-95 w-full h-full rounded-lg flex lg:flex-row flex-col shadow-lg items-center"
  >
    <div class="lg:w-1/2 lg:h-full flex flex-col justify-center">
      <h1
        class="text-center text-primary lg:text-6xl text-5xl font-black lg:pt-0 pt-6"
      >
        STORMY!
      </h1>
      <h2 class="lg:text-5xl text-4xl text-justify font-black m-6">
        Recevez les alertes météo et risques incendie directement par email,
        pour rester informé où que vous soyez !
      </h2>
    </div>
    <div class="lg:w-1/2 lg:h-full flex items-center justify-center flex-col">
      <UForm
        class="bg-white p-8 lg:m-8 m-6 rounded-lg shadow-2xl/40 space-y-4 lg:w-2/3 lg:h-3/4 flex flex-col"
        :state="state"
        @submit="onSubmit"
      >
        <h1 class="text-2xl font-bold mb-4">SOYEZ NOTIFIÉ EN TEMPS RÉEL</h1>
        <URadioGroup
          v-model="state.mode"
          color="primary"
          variant="table"
          default-value="email"
          :items="canal"
          size="xs"
        />
        <UInput
          v-if="state.mode === 'email'"
          v-model="state.email"
          name="email"
          type="email"
          placeholder="Adresse email"
          trailing-icon="i-lucide-at-sign"
          required
        />
        <UInput
          v-else
          v-model="state.webhook"
          name="webhook"
          type="url"
          placeholder="https://example.com/webhook"
          trailing-icon="i-lucide-link"
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
import type { FormSubmitEvent, RadioGroupItem } from "@nuxt/ui";
import { departements } from "~/utils/departements";

const canal = ref<RadioGroupItem[]>([
  {
    label: "Email",
    value: "email",
  },
  {
    label: "Webhook",
    value: "webhook",
  },
]);

const value = ref<string[]>([]);

const state = reactive({
  mode: "email",
  email: "",
  webhook: "",
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
        mode: state.mode,
        url: state.webhook,
        email: state.email,
        dept_code: state.departements,
        fire_alerts: state.fireRisk,
        warning_alerts: state.weatherAlert,
      },
    });

    toast.add({
      title: "Inscription réussie",
      color: "success",
      icon: "i-lucide-check-circle",
    });
  } catch (error) {
    console.error(error);
    toast.add({
      title: "Oops...",
      description:
        "On dirait qu'une erreur s'est produite. Veuillez réessayer plus tard.",
      color: "error",
      icon: "i-lucide-alert-triangle",
    });
  }
}
</script>
