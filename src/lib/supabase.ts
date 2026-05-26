import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://msvcrlijclhuifdjjmyy.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdmNybGlqY2xodWlmZGpqbXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3OTk5NjYsImV4cCI6MjA5NTM3NTk2Nn0.Wd8SCtIDUD5sZStwcgmrsDz6NKDkQO7C2MbqsYz4TK4";

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getPositions() {
  const { data, error } = await supabase
    .from("positions")
    .select("*")
    .order("live_value", { ascending: false });
  
  if (error) {
    console.error("Supabase error:", error);
    return [];
  }
  
  return data || [];
}

export async function getPositionHistory(ticker?: string) {
  let query = supabase
    .from("position_history")
    .select("*")
    .order("date", { ascending: false });
  
  if (ticker) {
    query = query.eq("ticker", ticker);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Supabase error:", error);
    return [];
  }
  
  return data || [];
}

export async function getPlays() {
  const { data, error } = await supabase
    .from("plays")
    .select("*")
    .order("timestamp", { ascending: false });
  
  if (error) {
    console.error("Supabase error:", error);
    return [];
  }
  
  return data || [];
}

export async function getWatchlist() {
  const { data, error } = await supabase
    .from("watchlist")
    .select("*")
    .order("added_at", { ascending: false });
  
  if (error) {
    console.error("Supabase error:", error);
    return [];
  }
  
  return data || [];
}

export async function addToWatchlist(item: any) {
  const { data, error } = await supabase
    .from("watchlist")
    .upsert(item)
    .select()
    .single();
  
  if (error) {
    console.error("Supabase error:", error);
    return null;
  }
  
  return data;
}

export async function getJournal() {
  const { data, error } = await supabase
    .from("journal")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(100);
  
  if (error) {
    console.error("Supabase error:", error);
    return [];
  }
  
  return data || [];
}

export async function addJournalEntry(entry: any) {
  const { data, error } = await supabase
    .from("journal")
    .insert(entry)
    .select()
    .single();
  
  if (error) {
    console.error("Supabase error:", error);
    return null;
  }
  
  return data;
}
