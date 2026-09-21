// Custom cake builder configuration — shared constants
// (No Supabase calls here — pure config, safe to import client-side)

export interface CustomCakeWeight {
  label: string;
  kg: number;
  portions: string;
  base_price: number;
}

export const CUSTOM_CAKE_WEIGHTS: CustomCakeWeight[] = [
  { label: '0.5 kg', kg: 0.5, portions: '4–6 portions',   base_price: 45  },
  { label: '1 kg',   kg: 1.0, portions: '8–12 portions',  base_price: 75  },
  { label: '1.5 kg', kg: 1.5, portions: '14–18 portions', base_price: 100 },
  { label: '2 kg',   kg: 2.0, portions: '20–26 portions', base_price: 130 },
  { label: '3 kg',   kg: 3.0, portions: '28–36 portions', base_price: 180 },
];

export interface Occasion {
  id: string;
  label: string;
  emoji: string;
  tagline: string;
}

export const OCCASIONS: Occasion[] = [
  { id: 'birthday',    label: 'Birthday',         emoji: '🎂', tagline: 'Celebrate every milestone'  },
  { id: 'anniversary', label: 'Anniversary',       emoji: '💑', tagline: 'A sweet symbol of your love' },
  { id: 'wedding',     label: 'Wedding',           emoji: '💍', tagline: 'The centrepiece of your day'  },
  { id: 'kids',        label: "Kids' Party",       emoji: '🎈', tagline: 'Fun, colourful & delicious'   },
  { id: 'corporate',   label: 'Corporate',         emoji: '🏢', tagline: 'Impress your team & clients'  },
  { id: 'other',       label: 'Just Surprise Me',  emoji: '✨', tagline: 'We love a creative brief!'    },
];

export interface CakeFlavor {
  name: string;
  emoji: string;
  description: string;
}

export const STATIC_FLAVORS: CakeFlavor[] = [
  { name: 'Vanilla',       emoji: '🤍', description: 'Classic Madagascar vanilla bean'     },
  { name: 'Chocolate',     emoji: '🍫', description: 'Rich Belgian dark chocolate'         },
  { name: 'Red Velvet',    emoji: '❤️', description: 'Velvety with a hint of cocoa'        },
  { name: 'Strawberry',    emoji: '🍓', description: 'Fresh strawberry cream sponge'       },
  { name: 'Lemon',         emoji: '🍋', description: 'Zesty lemon with elderflower notes'  },
  { name: 'Butterscotch',  emoji: '🧈', description: 'Warm caramel butterscotch layers'   },
  { name: 'Black Forest',  emoji: '🍒', description: 'Cherry, cream & dark chocolate'     },
  { name: 'Mango',         emoji: '🥭', description: 'Alphonso mango in every bite'       },
];

export const CUSTOM_STEP_LABELS = [
  'Occasion',
  'Size & Weight',
  'Sponge Flavor',
  'Frosting & Design',
  'Dietary',
  'Cake Message',
  'Reference Image',
  'Add-ons & Bundles',
  'Review Your Cake',
  'Add to Cart',
] as const;

export type CustomStep = 0|1|2|3|4|5|6|7|8|9;
