import {
  getWeatherAlerts,
  upsertWeatherAlerts,
} from "../lib/weather-alerts.js";

try {
  const alerts = await getWeatherAlerts();
  await upsertWeatherAlerts(alerts);
  console.log("✅ Alerts up to date with success");
} catch (err) {
  console.error("❌ Error:", err.message);
  process.exit(78);
}
