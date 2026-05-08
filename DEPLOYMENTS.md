# Deployments

## Prerequisites

```bash
npm install -g eas-cli
eas login   # log in with your Expo account (jahed04368)
```

Ensure `google-service-account.json` is present in the project root (gitignored — do not commit).

---

## Preview Build (Internal Testing)

Builds a shareable APK/IPA distributed via Expo's servers. No store account needed — great for testing on real devices before a store release.

```bash
eas build --profile preview --platform android
```

Once built, EAS prints a QR code and a link. Share the link with testers — they can install directly on Android without going through the Play Store.

For iOS preview (requires Apple Developer account):
```bash
eas build --profile preview --platform ios
```

---

## Play Store (Android)

### 1. Build a production AAB

```bash
eas build --profile production --platform android
```

The `autoIncrement: true` setting in `eas.json` bumps the version code automatically on each build.

### 2. Submit to Play Store

```bash
eas submit -p android
```

- Select the build you just created
- The service account key (`./google-service-account.json`) and internal track are configured automatically via `eas.json`

### 3. First submission only

When submitting a brand-new app for the first time, the app must already exist in Play Console (create it at [play.google.com/console](https://play.google.com/console)) and `releaseStatus` must be `"draft"` (already set in `eas.json`).

After the first draft is uploaded, go to Play Console → Internal testing → promote the release from draft to active.

### 4. Subsequent releases

Remove or change `releaseStatus` to `"completed"` in `eas.json` for future releases once the app is past draft state:

```json
"releaseStatus": "completed"
```

Then run steps 1 and 2 again.

---

## App Store (iOS) — future

### Prerequisites
- Apple Developer account ($99/year)
- Bundle ID registered at [developer.apple.com](https://developer.apple.com)
- App created in [App Store Connect](https://appstoreconnect.apple.com)

### 1. Build a production IPA

```bash
eas build --profile production --platform ios
```

EAS manages the signing certificates and provisioning profiles automatically.

### 2. Submit to App Store

```bash
eas submit -p ios
```

EAS will ask for your Apple ID and app-specific password (generate one at [appleid.apple.com](https://appleid.apple.com) under Security → App-Specific Passwords).

Or configure it permanently in `eas.json`:

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your@email.com",
      "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID"
    }
  }
}
```

### 3. After submission

Go to App Store Connect → your app → TestFlight (for beta) or App Store → submit for review.

---

## Key Files

| File | Purpose |
|------|---------|
| `eas.json` | Build and submit profiles |
| `app.json` | App name, version, package name, icons |
| `google-service-account.json` | Play Store API credentials — **never commit** |
| `docs/privacy-policy.html` | Hosted at GitHub Pages for store listings |

## Useful Commands

```bash
eas build:list                  # list all past builds
eas build --profile production --platform android --no-wait   # build without waiting
eas submit -p android           # submit latest build to Play Store
eas diagnostics                 # check environment setup
```
