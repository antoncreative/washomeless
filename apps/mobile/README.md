# Washomeless iOS app (demo build)

Expo / React Native app. Runs entirely on example data in `src/data.ts`, so it
works offline on stage — no Supabase or Stripe needed for the demo.

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

- Connect to the same Supabase project as the web app (auth, people, updates)
- Real payments via Stripe (Apple Pay) using the web app's checkout API
- Push notifications for milestones (`expo-notifications`)
- Ship to TestFlight / App Store with EAS: `npx eas-cli@latest build -p ios`
