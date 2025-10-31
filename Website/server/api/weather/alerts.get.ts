interface RequestBody {
  phenom_id: number;
  code: number;
  name: string;
  timelaps: { color_id: number; begin_time: string; end_time: string }[];
}

const PHENOM_MAP: Record<number, string> = {
  1: "Vent",
  2: "Pluie-inondation",
  3: "Orages",
  4: "Crues",
  5: "Neige-verglas",
  6: "Canicule",
  7: "Grand froid",
  8: "Avalanches",
  9: "Vagues-submersion",
};

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export default defineEventHandler(async (event) => {
  try {
    const { data, error } = await supabase
      .from("weather_alerts")
      .select("*")
      .not("timelaps", "is", null)
      .neq("timelaps", "[]")
      .order("code", { ascending: true });

    if (error) throw error;

    const result = data?.map((item) => ({
      ...item,
      phenom_id: PHENOM_MAP[item.phenom_id] ?? `Inconnu (${item.phenom_id})`,
    }));

    return result;
  } catch (error) {
    console.error("Error processing subscription:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Failed to process subscription request",
    });
  }
});
