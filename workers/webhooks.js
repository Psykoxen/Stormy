import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export async function getWebhooks() {
  const { data, error } = await supabase.from("webhooks").select("*");

  if (error) {
    console.error("Erreur lors de la récupération des webhooks :", error);
    return [];
  }

  return data;
}

export async function getWebhooksWithFilters(filters) {
  const { data, error } = await supabase
    .from("webhooks")
    .select("*")
    .match(filters);

  if (error) {
    console.error(
      "Erreur lors de la récupération des webhooks avec filtres :",
      error
    );
    return [];
  }

  return data;
}
