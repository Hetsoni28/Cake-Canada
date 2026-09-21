import { createClient } from "./supabase/server";

export interface ProductAddon {
  id: string;
  name: string;
  price: number;
}

export interface ProductOptionPrice {
  id: string;
  option_type: string;
  name: string;
  surcharge: number;
}

export async function getAddons(): Promise<ProductAddon[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("product_addons")
      .select("id, name, price")
      .eq("is_active", true)
      .order("display_order");
    return data || [];
  } catch (error) {
    console.error("Failed to fetch addons:", error);
    return [];
  }
}

export async function getOptionPrices(): Promise<ProductOptionPrice[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("product_option_prices")
      .select("id, option_type, name, surcharge")
      .eq("is_active", true)
      .order("display_order");
    return data || [];
  } catch (error) {
    console.error("Failed to fetch option prices:", error);
    return [];
  }
}
