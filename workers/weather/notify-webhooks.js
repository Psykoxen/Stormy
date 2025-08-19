import axios from "axios";
import {
  getWeatherAlertStarting,
  getWeatherAlertsEnding,
} from "../lib/weather-alerts.js";
import { getWebhooksWithFilters } from "../lib/webhooks.js";

try {
  await notifyEndingWeatherAlerts();
  await notifyStartingWeatherAlerts();
} catch (err) {
  console.error("❌ Error:", err.message);
  process.exit(1);
}

function formatStartingAlertMessage(alert) {
  let emoji = "⚪";
  let exaColor = "#ffffff";
  let colorLabel = "Inconnu";

  switch (alert.color.toLowerCase()) {
    case "vert":
      emoji = "🟢";
      exaColor = "#00ff00";
      colorLabel = "VIGILANCE VERTE";
      break;
    case "jaune":
      emoji = "🟡";
      exaColor = "#ffff00";
      colorLabel = "VIGILANCE JAUNE";
      break;
    case "orange":
      emoji = "🟠";
      exaColor = "#ff7f00";
      colorLabel = "VIGILANCE ORANGE";
      break;
    case "rouge":
      emoji = "🔴";
      exaColor = "#ff0000";
      colorLabel = "VIGILANCE ROUGE";
      break;
  }

  return `${emoji} <font color="${exaColor}"><b>${colorLabel}</b></font> pour <b>${
    alert.name
  }</b><br><i>Fin prévue le ${new Date(alert.endtime).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}</i>`;
}

function formatEndingAlertMessage(alert) {
  let emoji = "⚪";
  let exaColor = "#ffffff";
  let colorLabel = "Inconnu";

  switch (alert.color.toLowerCase()) {
    case "vert":
      emoji = "🟢";
      exaColor = "#4cbe87";
      colorLabel = "VIGILANCE VERTE";
      break;
    case "jaune":
      emoji = "🟡";
      exaColor = "#ecba49";
      colorLabel = "VIGILANCE JAUNE";
      break;
    case "orange":
      emoji = "🟠";
      exaColor = "#fc824e";
      colorLabel = "VIGILANCE ORANGE";
      break;
    case "rouge":
      emoji = "🔴";
      exaColor = "#d63a4e";
      colorLabel = "VIGILANCE ROUGE";
      break;
  }

  return `${emoji} <font color="${exaColor}"><b>${colorLabel}</b></font> pour <b>${alert.name}</b>`;
}

async function notifyStartingWeatherAlerts() {
  const alerts = await getWeatherAlertStarting();
  if (!alerts || alerts.length === 0) {
    return;
  }

  const webhooks = await getWebhooksWithFilters({ warning_alerts: true });
  for (const webhook of webhooks) {
    const deptCodes = webhook.dept_code || [];
    const alertsToSend = alerts.filter((alert) =>
      deptCodes.includes(alert.code)
    );

    for (const alert of alertsToSend) {
      try {
        await axios.post(webhook.url, {
          cardsV2: [
            {
              cardId: "alert-card",
              card: {
                header: {
                  title: `📢 Début de vigilance météorologique`,
                  subtitle: `Département concerné : ${alert.dpt} (${alert.code})`,
                },
                sections: [
                  {
                    widgets: [
                      {
                        textParagraph: {
                          text: formatStartingAlertMessage(alert),
                        },
                      },
                    ],
                  },
                ],
              },
            },
          ],
        });
      } catch (error) {
        console.error(
          `❌ Erreur lors de l'envoi de l'alerte pour le département ${alert.code} :`,
          error.message
        );
      }
    }
  }
}

async function notifyEndingWeatherAlerts() {
  const alerts = await getWeatherAlertsEnding();

  if (!alerts || alerts.length === 0) {
    return;
  }

  const webhooks = await getWebhooksWithFilters({ warning_alerts: true });
  for (const webhook of webhooks) {
    const deptCodes = webhook.dept_code || [];
    const alertsToSend = alerts.filter((alert) =>
      deptCodes.includes(alert.code)
    );

    for (const alert of alertsToSend) {
      try {
        await axios.post(webhook.url, {
          cardsV2: [
            {
              cardId: "alert-card",
              card: {
                header: {
                  title: `🔔 Fin de vigilance météorologique`,
                  subtitle: `Département concerné : ${alert.dpt} (${alert.code})`,
                },
                sections: [
                  {
                    widgets: [
                      {
                        textParagraph: {
                          text: formatEndingAlertMessage(alert),
                        },
                      },
                    ],
                  },
                ],
              },
            },
          ],
        });
      } catch (error) {
        console.error(
          `❌ Erreur lors de l'envoi de l'alerte pour le département ${alert.code} :`,
          error.message
        );
      }
    }
  }
}
