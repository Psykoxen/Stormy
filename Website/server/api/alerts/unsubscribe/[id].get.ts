import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { getRouterParam } from "h3";

config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Missing ID in URL",
    });
  }

  try {
    const { error } = await supabase
      .from("users")
      .update({ fire_alerts: false })
      .eq("uuid", id);

    if (error) throw error;

    return {
      success: true,
      message: `Fire alerts unsubscribed for user with ID ${id}`,
    };
  } catch (error) {
    console.error("Error processing unsubscription:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to process unsubscription request",
    });
  }
});
