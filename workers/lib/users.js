import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export async function getUsers() {
  const { data, error } = await supabase.from("users").select("*");

  if (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    return [];
  }

  return data;
}

export async function getUsersWithFilters(filters) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .match(filters);

  if (error) {
    console.error(
      "Erreur lors de la récupération des utilisateurs avec filtres :",
      error
    );
    return [];
  }

  return data;
}
