# MOVE Mobile (React Native + Expo)

MVP for MOVE subscription app with RTL-first Arabic UX.

## Implemented

- Onboarding goal selection
- Subscription selection flow
- Main tab app with:
  - Dashboard (health overview + admin plan version)
  - Weekly plan tracking
  - Workout details (video-style screen)
  - Nutrition plan and daily meals
  - Recovery & injury reporting flow
  - Community conversations
  - Device integration hub (Apple Health / Google Fit / Garmin placeholders)
- Admin-driven config service abstraction (`src/services/adminConfigService.ts`)
- Subscription service abstraction (`src/services/subscriptionService.ts`)
- Health-device service abstraction (`src/services/healthDeviceService.ts`)

## Project Structure

- `src/navigation` app navigation
- `src/screens` feature screens
- `src/data/mockData.ts` demo content
- `src/services` backend integration boundaries
- `src/components` reusable UI
- `src/theme` design tokens and shared styles

## Run

```bash
cd move-mobile
npm install
npm run android
# or
npm run web
```

## Next Steps (Production)

1. Connect Firebase Auth + user roles (trainee/coach/admin)
2. Replace mock services with Firestore + Cloud Functions
3. Implement subscription billing (App Store / Google Play + backend verification)
4. Integrate HealthKit + Google Fit APIs
5. Build admin CMS screens for workout/nutrition plan publishing
6. Add push notifications for coach/team messages and challenge reminders
