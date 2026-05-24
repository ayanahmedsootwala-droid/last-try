# XYZ Automobiles — Complete Source Archive (v34)

Generated: 5/24/2026, 6:34:03 AM
Version: v34
Total files packaged: 440

## What's new in v34
- Fixed dealer contact not displaying on CarDetailPage when toggled from AdminInventory
- Root cause: dealerPhone was reading site_settings instead of car.dealership.phone from the joined dealerships row
- Fix: CarDetailPage now reads car.dealership?.phone, car.dealership?.email, car.dealership?.name for dealer contact type
- Dealer WhatsApp, phone display, email, and contact name all now correctly use the actual dealership record
- AdminTheme completely rebuilt with 3-tab layout: Color Presets, Font Presets, Fine-tune
- Added 5 color presets with live preview: Midnight (default), Crimson Edge, Sapphire, Forest, Slate Pro
- Each preset has 4-swatch color strip + a mini card preview rendering real site UI elements (nav bar, stat cards, listing card) using that preset's exact tokens
- Selecting a preset applies all CSS variables to :root instantly for live site-wide preview
- Added 5 font presets: Montserrat (current), Inter, Playfair Display, Raleway, DM Sans
- Font selection loads Google Fonts dynamically and applies to body+headings immediately
- Typography scale preview card renders all heading levels and body/caption in the chosen font
- Fine-tune tab retained with per-token color picker + HSL input for precise control
- Export CSS button generates a complete .css file with both :root light vars, .dark vars, font import and font-family declaration
- Preview Active badge shown in header whenever a preset/font/manual change is live

## What's new in v33
- Vehicle database expanded: added 20+ new brands including BMW, Mercedes-Benz, Audi, Volkswagen, Porsche, Volvo, Jeep, Ford, Chevrolet, MINI, Proton, Prince, United, Regal, Master, Peugeot, Renault, Land Rover, Genesis, Chery
- Added 100+ new models across all brands (e.g. 3 Series, C-Class, A4, Golf, Cayenne, XC90, Wrangler, F-150, Silverado, Cooper, Saga, etc.)
- Added 200+ new variants for popular models (e.g. Toyota Corolla 1.6 GLi, Honda Civic Oriel 1.8, Kia Sportage FWD, Hyundai Tucson GLS, etc.)
- All listing forms (SellCarPage, DealershipInventory, AdminInventory) now show cascading Brand → Model → Variant dropdowns backed by the expanded database
- Added "Other (specify)" option to Brand, Model, Variant, and Color dropdowns in every listing form
- Added "Unregistered" as the first option in the Registration Year dropdown on all listing forms; stored as NULL in the database
- New reusable OtherInput component (src/components/ui/other-input.tsx)

## What's new in v32
- AdminDealerships Manage Members: replaced email-only input with a searchable user picker showing all registered users (name + email)
- DealershipInventory listing form: added read-only brand contact info panel
- CarDetailPage contact card: replaced \"Admin contact\" label with actual site brand name from site_settings
- AdminInventory contact toggle: \"Admin\" label replaced with site brand name

## What's new in v31
- Fixed dealership linking: all 5 portal pages were querying non-existent dealership_staff table — unified to dealership_members
- DealershipTeam: fixed role enum values and member sync
- AdminDealerships: added Manage Members dialog
- AdminUsers: updated role options

## Structure
```
xyz-automobiles/
  index.html
  package.json
  vite.config.ts
  src/           → All React/TypeScript/CSS source files
  supabase/      → Supabase config, migrations, edge functions
  public/        → Static assets
```

## Setup
1. `pnpm install`
2. Copy `.env.example` to `.env` and fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
3. `pnpm dev`
