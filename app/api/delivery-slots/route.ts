import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("delivery_slots")
    .select("id, label, start_time, end_time")
    .eq("is_active", true)
    .order("start_time");

  if (error) {
    return NextResponse.json({ slots: [] }, { status: 500 });
  }

  return NextResponse.json({ slots: data ?? [] });
}
