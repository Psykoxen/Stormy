console.log(`Chargement des alertes météo...`);
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import dotenv from "dotenv";
import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import { upsertFireAlerts } from "./fire.js";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

// try {
//   const { data } = await axios.get(
//     `https://public-api.meteofrance.fr/public/DPVigilance/v1/textesvigilance/encours`,
//     {
//       headers: {
//         accept: "*/*",
//         apikey: process.env.METEO_API_KEY,
//       },
//     }
//   );
//   console.log(`Alertes Météo-France`, data);
//   console.log(`Alertes Météo-France`, data.product.text_bloc_items);
// } catch (error) {
//   console.error(`Erreur Météo-France`, error.message);
// }

// const data = await getWeatherAlerts();
// const data = await getFireAlerts();
// console.log(`Alertes Météo-France`, data);
upsertFireAlerts();
// console.log(`Alertes Météo-France`, await getUsers());

// const data_by_region = Object.fromEntries(
//   data.map((item) => [item.domain_id, item])
// );

// console.log(JSON.stringify(data_by_region["14"].bloc_items));
// await sendWeatherAlerts(
//   "antoine.voillot@yahoo.fr",
//   "Antoine Voillot",
//   data_by_region["34"].bloc_title,
//   {
//     content: JSON.stringify(data_by_region["34"].bloc_items),
//   }
// );

//await saveBulletins(data);

async function saveBulletins(data) {
  for (const bloc of data) {
    const { domain_id, domain_name, bloc_items } = bloc;
    console.log(domain_name);
    console.log(bloc_items);
    console.log(bloc_items[1].text_items[0].term_items[0].risk_name);

    // const { error } = await supabase.from("alert").upsert({
    //   id: domain_id,
    //   name: domain_name,
    //   color: bloc_items[1].text_items[0].term_items[0].risk_name,
    // });

    // if (error) console.error("❌ Erreur insertion :", error);
  }
}

async function getWeatherAlerts() {
  return axios
    .get(
      `https://public-api.meteofrance.fr/public/DPVigilance/v1/textesvigilance/encours`,
      {
        headers: {
          accept: "*/*",
          apikey: process.env.METEO_API_KEY,
        },
      }
    )
    .then((response) => {
      //console.log(`Alertes Météo-France`, response.data);
      return response.data.product.text_bloc_items;
    })
    .catch((error) => {
      console.error(`Erreur Météo-France`, error.message);
      throw error;
    });
}

async function sendWeatherAlerts(
  recipients_email,
  recipients_name,
  subject,
  content
) {
  const mailerSend = new MailerSend({
    apiKey: process.env.MAILER_API_KEY,
  });

  const sentFrom = new Sender(
    "test@test-xkjn41m7jq64z781.mlsender.net",
    "Stormy Alerts"
  );

  const recipients = [new Recipient(recipients_email, recipients_name)];

  const personalization = [
    {
      email: recipients_email,
      data: {
        content: content.content,
      },
    },
  ];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setPersonalization(personalization)
    .setSubject(subject)
    .setTemplateId("3zxk54vnwozljy6v");

  await mailerSend.email.send(emailParams);
}
