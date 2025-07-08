import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import dotenv from "dotenv";
import { sendEmail } from "./communication.js";

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

  // Parse CSV en objets JS
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

  return data;
}

export async function upsertFireAlerts() {
  const alerts = await getFireAlerts();
  const formattedAlerts = alerts.map((a) => ({
    updated_at: a.reference_time,
    code: a.dep_code,
    name: a.dep_nom,
    j1: parseInt(a.niveau_j1),
    j2: parseInt(a.niveau_j2),
  }));

  const depCodes = formattedAlerts.map((a) => a.code);

  const { data: existingAlerts, error: fetchError } = await supabase
    .from("fire_alerts")
    .select("code, updated_at, j1")
    .in("code", depCodes);

  if (fetchError) {
    console.error("Erreur récupération données existantes:", fetchError);
    return;
  }

  const changedHighRiskDeps = formattedAlerts.filter((a) => {
    const old = existingAlerts.find((e) => e.code === a.code);
    return old && old.updated_at !== a.updated_at && a.j1 > 1;
  });

  const { error: upsertError } = await supabase
    .from("fire_alerts")
    .upsert(formattedAlerts, {
      onConflict: ["code"],
    });

  if (upsertError) {
    console.error("Erreur upsert:", upsertError);
    return;
  }

  const users = await getUsersForFireAlerts();
  for (const alert of changedHighRiskDeps) {
    const usersToNotify = users.filter((u) => u.dept_code.includes(alert.code));
    usersToNotify.forEach(async (user) => {
      try {
        await sendEmail(
          user.email,
          user.name || "Utilisateur",
          generateSubject(alert),
          generateContent(alert)
        );
      } catch (error) {
        console.error(
          `Erreur lors de l'envoi de l'email à ${user.email}:`,
          error
        );
      }
    });
  }
}

export async function getUsersForFireAlerts() {
  const { data, error } = await supabase
    .from("users")
    .select("email, dept_code")
    .eq("fire_alerts", true);

  if (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    return [];
  }
  return data;
}

function generateSubject(alert) {
  switch (alert.j1) {
    case 1:
      return `🟢 Alerte incendie - Risque faible pour le département ${alert.name} (${alert.code}) 🟢`;
    case 2:
      return `🟡 Alerte incendie - Risque modéré pour le département ${alert.name} (${alert.code}) 🟡`;
    case 3:
      return `🟠 Alerte incendie - Risque élevé pour le département ${alert.name} (${alert.code}) 🟠`;
    case 4:
      return `🔴 Alerte incendie - Risque très élevé pour le département ${alert.name} (${alert.code}) 🔴`;
    default:
      return `Alerte incendie - Risque inconnu pour le département ${alert.name} (${alert.code})`;
  }
}

// Generates the content of the email based on the alert data with HTML formatting
function generateContent(alert) {
  let risk, color, advise;
  switch (alert.j1) {
    case 1:
      risk = "faible";
      color = "#22b14C";
      break;
    case 2:
      risk = "modéré";
      color = "#FFF200";
      break;
    case 3:
      risk = "élevé";
      color = "#FF854A";
      break;
    case 4:
      risk = "très élevé";
      color = "#ED1C24";
      break;
    default:
      risk = "inconnu";
  }

  switch (alert.j1) {
    case 1:
      advise = "Aucune mesure particulière à prendre.";
      break;
    case 2:
      advise =
        "Les accès aux massifs sont autorisés et les travaux autorisés avec dispositif de prévention et d'extinction approprié sous la responsabilité du chef de chantier";
      break;
    case 3:
      advise =
        "Les accès aux massifs sont déconseillés et travaux autorisés de 5h à 12h sous réserve dispositif de prévention et d'extinction.";
      break;
    case 4:
      advise =
        "Les accès aux massifs sont interdits et les travaux sont interdits dans les espaces forestiers et 200m autour.";
      break;
    default:
      advise = "Aucune information disponible pour ce niveau de risque.";
  }

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
 <head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>New Message</title><!--[if (mso 16)]>
    <style type="text/css">
    a {text-decoration: none;}
    </style>
    <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
<noscript>
         <xml>
           <o:OfficeDocumentSettings>
           <o:AllowPNG></o:AllowPNG>
           <o:PixelsPerInch>96</o:PixelsPerInch>
           </o:OfficeDocumentSettings>
         </xml>
      </noscript>
<![endif]--><!--[if mso]><xml>
    <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word">
      <w:DontUseAdvancedTypographyReadingMail/>
    </w:WordDocument>
    </xml><![endif]-->
  <style type="text/css">
.rollover:hover .rollover-first {
  max-height:0px!important;
  display:none!important;
}
.rollover:hover .rollover-second {
  max-height:none!important;
  display:block!important;
}
.rollover span {
  font-size:0px;
}
u + .body img ~ div div {
  display:none;
}
#outlook a {
  padding:0;
}
span.MsoHyperlink,
span.MsoHyperlinkFollowed {
  color:inherit;
  mso-style-priority:99;
}
a.es-button {
  mso-style-priority:100!important;
  text-decoration:none!important;
}
a[x-apple-data-detectors],
#MessageViewBody a {
  color:inherit!important;
  text-decoration:none!important;
  font-size:inherit!important;
  font-family:inherit!important;
  font-weight:inherit!important;
  line-height:inherit!important;
}
.es-desk-hidden {
  display:none;
  float:left;
  overflow:hidden;
  width:0;
  max-height:0;
  line-height:0;
  mso-hide:all;
}
@media only screen and (max-width:600px) {.es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-p-default { } *[class="gmail-fix"] { display:none!important } p, a { line-height:150%!important } h1, h1 a { line-height:120%!important } h2, h2 a { line-height:120%!important } h3, h3 a { line-height:120%!important } h4, h4 a { line-height:120%!important } h5, h5 a { line-height:120%!important } h6, h6 a { line-height:120%!important } .es-header-body p { } .es-content-body p { } .es-footer-body p { } .es-infoblock p { } h1 { font-size:36px!important; text-align:left } h2 { font-size:26px!important; text-align:left } h3 { font-size:20px!important; text-align:left } h4 { font-size:24px!important; text-align:left } h5 { font-size:20px!important; text-align:left } h6 { font-size:16px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:36px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .es-header-body h4 a, .es-content-body h4 a, .es-footer-body h4 a { font-size:24px!important } .es-header-body h5 a, .es-content-body h5 a, .es-footer-body h5 a { font-size:20px!important } .es-header-body h6 a, .es-content-body h6 a, .es-footer-body h6 a { font-size:16px!important } .es-menu td a { font-size:12px!important } .es-header-body p, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body a { font-size:16px!important } .es-footer-body p, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock a { font-size:12px!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3, .es-m-txt-c h4, .es-m-txt-c h5, .es-m-txt-c h6 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3, .es-m-txt-r h4, .es-m-txt-r h5, .es-m-txt-r h6 { text-align:right!important } .es-m-txt-j, .es-m-txt-j h1, .es-m-txt-j h2, .es-m-txt-j h3, .es-m-txt-j h4, .es-m-txt-j h5, .es-m-txt-j h6 { text-align:justify!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3, .es-m-txt-l h4, .es-m-txt-l h5, .es-m-txt-l h6 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-m-txt-r .rollover:hover .rollover-second, .es-m-txt-c .rollover:hover .rollover-second, .es-m-txt-l .rollover:hover .rollover-second { display:inline!important } .es-m-txt-r .rollover span, .es-m-txt-c .rollover span, .es-m-txt-l .rollover span { line-height:0!important; font-size:0!important; display:block } .es-spacer { display:inline-table } a.es-button, button.es-button { font-size:20px!important; padding:10px 20px 10px 20px!important; line-height:120%!important } a.es-button, button.es-button, .es-button-border { display:inline-block!important } .es-m-fw, .es-m-fw.es-fw, .es-m-fw .es-button { display:block!important } .es-m-il, .es-m-il .es-button, .es-social, .es-social td, .es-menu { display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .adapt-img { width:100%!important; height:auto!important } .es-mobile-hidden, .es-hidden { display:none!important } .es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } .h-auto { height:auto!important } }
@media screen and (max-width:384px) {.mail-message-content { width:414px!important } }
</style>
 </head>
 <body class="body" style="width:100%;height:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
  <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#FAFAFA"><!--[if gte mso 9]>
			<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
				<v:fill type="tile" color="#fafafa"></v:fill>
			</v:background>
		<![endif]-->
   <table width="100%" cellspacing="0" cellpadding="0" class="es-wrapper" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FAFAFA">
     <tr>
      <td valign="top" style="padding:0;Margin:0">
       <table cellpadding="0" cellspacing="0" align="center" class="es-content" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table bgcolor="#ffffff" align="center" cellpadding="0" cellspacing="0" class="es-content-body" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
             <tr>
              <td align="left" style="Margin:0;padding-top:30px;padding-right:20px;padding-bottom:30px;padding-left:20px">
               <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px;font-size:0px"><img src="https://fviecfq.stripocdn.email/content/guids/CABINET_c48bd15f582d0aa5de2116e461847d54b29f984cdc74c69748500443233fcb7a/images/istockphoto1323529010612x612.jpg" alt="" width="100" class="adapt-img" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></td>
                     </tr>
                     <tr>
                      <td align="center" style="padding:0;Margin:0;padding-bottom:10px"><h1 class="es-m-txt-c" style="Margin:0;font-family:arial, 'helvetica neue', helvetica, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:46px;font-style:normal;font-weight:bold;line-height:46px;color:#333333">Risque incendie <span style="color:${color}">${risk}</span></h1></td>
                     </tr>
                     <tr>
                      <td align="center" class="es-m-p0r es-m-p0l" style="Margin:0;padding-top:5px;padding-right:40px;padding-bottom:5px;padding-left:40px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;letter-spacing:0;color:#333333;font-size:14px">${advise}</p></td>
                     </tr>
                     <tr>
                      <td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:5px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;letter-spacing:0;color:#8f9194;font-size:14px;font-style:italic">D'autres mesures peuvent être appliquées par les autorités locales, veillez à vous renseigner avant de vous engager dans ce secteur.</p></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table></td>
     </tr>
   </table>
  </div>
 </body>
</html>
  `;
}
