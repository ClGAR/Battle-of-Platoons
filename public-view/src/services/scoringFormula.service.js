import { supabase, supabaseConfigured } from "./supabase";

export async function getActiveFormula(battle_type, week_key) {
  if (!supabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const { data, error } = await supabase.rpc("get_active_scoring_formula", {
    battle_type,
    week_key,
  });

  return { data, error };
}
