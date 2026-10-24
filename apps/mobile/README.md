# Washomeless iOS app (demo build)

Expo / React Native app. Reads live people and updates (text, photo, voice) from the
same Supabase project as washomeless.com, refreshing every 15 seconds. If it's offline
or no one is approved yet, it falls back to the example profiles in `src/data.ts`.
"Join the circle" checkout is still demo-only (no real payment).

Setup: copy `.env.example` to `.env.local` and fill in the Supabase URL and anon key.

## Run it

```bash
cd apps/mobile
npm install
npx expo start --ios      # opens in the Xcode iPhone simulator
```

On a real iPhone: install **Expo Go** from the App Store, run `npx expo start`,
and scan the QR code with the Camera app (phone and laptop on the same Wi-Fi).

## Demo script (about 60 seconds)

1. Welcome screen → **Get started**
2. Discover → tap **Marcus T.** → show the 100-dot donor grid, story, journey, diary
3. **Join the circle · $30/mo** → **Pay** (demo, no real charge) → success
4. Back on the profile: count goes 87 → 88 and your dot is highlighted
5. **My Circle** tab (badge shows 1) → **Activity** tab shows "You joined a circle"

## Next steps after the event

- Log in from the app (donors and sponsored people)
- Real payments via Stripe (Apple Pay) using the web app's checkout API
- Push notifications for milestones (`expo-notifications`)
- Ship to TestFlight / App Store with EAS: `npx eas-cli@latest build -p ios`
