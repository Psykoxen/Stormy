import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export default async function getUsers() {
  const { data, error } = await supabase.from("users").select("*");

  if (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    return [];
  }

  return data;
}
