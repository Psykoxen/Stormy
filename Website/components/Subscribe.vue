<template>
  <UModal title="Politique de Confidentialité" v-model="RGPD" fullscreen>
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
            orientation="horizontal"
            :items="canal"
            size="xs"
            :ui="{
              item: 'w-full',
            }"
          />
          <UInput
            v-if="state.mode === 'email'"
            v-model="state.email"
            name="email"
            type="email"
            placeholder="Adresse email"
            trailing-icon="i-lucide-at-sign"
          />
          <UInput
            v-else
            v-model="state.webhook"
            name="webhook"
            type="url"
            placeholder="https://example.com/webhook"
            trailing-icon="i-lucide-link"
          />
          <USelectMenu
            v-model="value"
            value-key="value"
            multiple
            name="departements"
            :items="items"
            placeholder="Sélectionnez vos départements"
          />
          <div class="flex justify-evenly">
            <USwitch label="Risque incendie" name="fire-risk" default-value />
            <USwitch
              disabled
              label="Vigilance météorologique"
              description="Disponible prochainement"
            />
          </div>
          <UCheckbox required v-model="state.CGU">
            <template #label>
              J’accepte que mes données soient utilisées conformément à la
              <button
                type="button"
                class="text-primary underline hover:opacity-80"
                @click="RGPD = true"
              >
                politique de confidentialité</button
              >.
            </template>
          </UCheckbox>
          <div class="flex justify-center">
            <UButton type="submit" class="w-content text-center">
              Être Alerter !
            </UButton>
          </div>
        </UForm>
      </div>
    </div>

    <template #body><CGU /></template>
  </UModal>
</template>

<script setup lang="ts">
import type { FormSubmitEvent, RadioGroupItem } from "@nuxt/ui";
import { departements } from "~/utils/departements";

const RGPD = ref(false);

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
  CGU: false,
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

  if (
    state.mode === "email" &&
    !state.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  ) {
    toast.add({
      title: "Adresse email invalide.",
      color: "error",
      icon: "i-lucide-alert-triangle",
    });
    return;
  } else if (state.mode === "webhook" && !state.webhook.startsWith("http")) {
    toast.add({
      title: "URL de webhook invalide.",
      color: "error",
      icon: "i-lucide-alert-triangle",
    });
    return;
  } else if (value.value.length === 0) {
    toast.add({
      title: "Veuillez sélectionner au moins un département.",
      color: "error",
      icon: "i-lucide-alert-triangle",
    });
    return;
  } else if (!state.CGU) {
    toast.add({
      title: "Vous devez accepter la politique de confidentialité.",
      color: "error",
      icon: "i-lucide-alert-triangle",
    });
    return;
  }

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
