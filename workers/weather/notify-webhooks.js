import axios from "axios";
import { getUpdatedFireAlerts } from "../lib/fire-alerts.js";
import { getWebhooksWithFilters } from "../lib/webhooks.js";

const tomorrow = new Date(Date.now() + 86400000);
const tomorrow_long = tomorrow.toLocaleDateString("fr-FR", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

try {
  const alerts = await getUpdatedFireAlerts();

  if (!alerts || alerts.length === 0) {
    console.log("No updated fire alerts found.");
    process.exit(0);
  }

  const webhooks = await getWebhooksWithFilters({ fire_alerts: true });
  for (const webhook of webhooks) {
    const deptCodes = webhook.dept_code || [];
    const alertsToSend = alerts.filter((alert) =>
      deptCodes.includes(alert.code)
    );

    const alertsSections = alertsToSend.map((alert) => ({
      widgets: [
        {
          textParagraph: {
            text: generateWebhookMessage(alert),
          },
        },
      ],
    }));

    await axios.post(
      webhook.url,
      {
        cards: [
          {
            header: {
              title: `<b>🔥 Risque Incendie 🔥</b>`,
              subtitle: `<i>${tomorrow_long.charAt(0).toUpperCase() + tomorrow_long.slice(1)}</i>`,
            },
            sections: alertsSections,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
} catch (err) {
  console.error("❌ Error:", err.message);
  process.exit(1);
}

function generateWebhookMessage(alert) {
  switch (alert.j1) {
    case 1:
      return `<b>${alert.name} (${alert.code})</b> : Risque faible 🟢`;
    case 2:
      return `<b>${alert.name} (${alert.code})</b> : Risque modéré 🟡`;
    case 3:
      return `<b>${alert.name} (${alert.code})</b> : Risque élevé 🟠`;
    case 4:
      return `<b>${alert.name} (${alert.code})</b> : Risque très élevé 🔴`;
    default:
      return `<b>${alert.name} (${alert.code})</b> : Risque inconnu ⚪`;
  }
}
