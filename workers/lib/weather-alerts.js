import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import dotenv from "dotenv";
import isEqual from "lodash/isEqual.js";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

const WeatherAlert = {
  1: "Vent",
  2: "Pluie",
  3: "Orage",
  4: "Crues",
  5: "Neige / Verglas",
  6: "Canicule",
  7: "Grand Froid",
  8: "Avalanches",
  9: "Vagues-submersion",
};

const WeatherLevel = {
  1: "Vert",
  2: "Jaune",
  3: "Orange",
  4: "Rouge",
  5: "Violet",
};
export async function getWeatherAlerts() {
  const response = await axios.get(
    `https://public-api.meteofrance.fr/public/DPVigilance/v1/cartevigilance/encours`,
    {
      headers: {
        accept: "*/*",
        apikey: process.env.FIRE_API_KEY,
      },
    }
  );
  const updatedAt = response.data.product.update_time;
  const { timelaps } = response.data.product.periods[0];

  const alerts = timelaps.domain_ids.flatMap((dep) =>
    dep.phenomenon_items.map((phenom) => ({
      code: dep.domain_id,
      updated_at: updatedAt,
      phenom_id: phenom.phenomenon_id,
      timelaps: phenom.timelaps_items,
    }))
  );

  return alerts;
}

export async function upsertWeatherAlerts(alerts) {
  const { data: existingAlerts, error } = await supabase
    .from("weather_alerts")
    .select("*");

  if (error) throw error;

  const changedAlerts = alerts.filter((alert) => {
    const existing = existingAlerts.find(
      (e) => e.code == alert.code && e.phenom_id == alert.phenom_id
    );

    if (!existing) return true;
    const updatedAtEqual =
      new Date(existing.updated_at).getTime() ===
      new Date(alert.updated_at).getTime();

    if (!updatedAtEqual || !isEqual(existing.timelaps, alert.timelaps)) {
      return true;
    }
  });

  if (changedAlerts.length > 0) {
    const { error: upsertError } = await supabase
      .from("weather_alerts")
      .upsert(changedAlerts, {
        onConflict: ["code", "phenom_id"],
      });
    if (upsertError) throw upsertError;
    console.log("✅ Weather alerts upserted successfully.");
  } else {
    console.log("✅ No changes detected in weather alerts.");
    process.exit(1);
  }
}

export async function getWeatherAlertStarting() {
  const existingAlerts = await getExistingWeatherAlerts();
  const toSend = [];
  if (existingAlerts.length === 0) {
    console.log("❌ No existing weather alerts to send.");
    return;
  }
  for (const alert of existingAlerts) {
    for (const timelap of alert.timelaps) {
      if (!timelap) continue;
      if (timelap.color_id <= 1) continue; // Skip green alerts
      const diffMs = new Date(timelap.begin_time).getTime() - Date.now();
      if (Math.abs(diffMs) <= 10 * 60 * 1000) {
        toSend.push({
          code: alert.code,
          dpt: alert.name,
          name: WeatherAlert[alert.phenom_id],
          color: WeatherLevel[timelap.color_id],
          starttime: timelap.begin_time,
          endtime: timelap.end_time,
        });
      }
    }
  }
  return toSend;
}

export async function getWeatherAlertsEnding() {
  const existingAlerts = await getExistingWeatherAlerts();
  const toSend = [];
  if (existingAlerts.length === 0) {
    console.log("❌ No existing weather alerts to send.");
    return;
  }
  for (const alert of existingAlerts) {
    for (const timelap of alert.timelaps) {
      if (!timelap) continue;
      if (timelap.color_id <= 1) continue; // Skip green alerts
      const diffMs = new Date(timelap.end_time).getTime() - Date.now();
      if (Math.abs(diffMs) <= 10 * 60 * 1000) {
        toSend.push({
          code: alert.code,
          dpt: alert.name,
          name: WeatherAlert[alert.phenom_id],
          color: WeatherLevel[timelap.color_id],
          endtime: timelap.end_time,
        });
      }
    }
  }
  return toSend;
}

export async function getExistingWeatherAlerts() {
  const { data, error } = await supabase.from("weather_alerts").select("*");

  if (error) throw error;
  return data;
}
