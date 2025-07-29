import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export async function getFireAlerts() {
  const response = await axios.get(
    `https://public-api.meteofrance.fr/public/DPMeteoForets/v1/carte/encours`,
    {
      headers: {
        accept: "*/*",
        apikey: process.env.FIRE_API_KEY,
      },
    }
  );

  const rawCsv = response.data;

  const rows = rawCsv.trim().split("\n");
  const headers = rows.shift().split(";");

  const data = rows.map((row) => {
    const values = row.split(";");
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i];
    });
    return obj;
  });

  const formattedData = data.map((alert) => ({
    updated_at: alert.reference_time,
    code: alert.dep_code,
    name: alert.dep_nom,
    j1: parseInt(alert.niveau_j1),
    j2: parseInt(alert.niveau_j2),
  }));

  return formattedData;
}

export async function upsertFireAlerts(alerts) {
  const { error: upsertError } = await supabase
    .from("fire_alerts")
    .upsert(alerts, {
      onConflict: ["code"],
    });
  if (upsertError) {
    console.error("Error upserting fire alerts:", upsertError);
    throw upsertError;
  }
}

export async function getUpdatedFireAlerts() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("fire_alerts")
    .select("*")
    .gte("updated_at", oneHourAgo);

  if (error) throw error;
  return data;
}
