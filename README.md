# Food Scanner

**Food Scanner** is a mobile app that uses AI to instantly detect if a fruit or vegetable is **Fresh** or **Rotten** — right from your phone's camera!

Built with **React Native (Expo)**, **TensorFlow.js**, and a custom-trained model hosted on a backend API.

Perfect for hackathons — fast, beautiful, and fully functional!

---

## Features

- Real-time camera scanning
- Instant Fresh / Rotten detection with confidence %
- Modern, clean UI (NativeWind / Tailwind CSS)
- First-time user tutorial
- Torch control for low-light scanning
- Requires internet (model inference via backend API)

---



## Requirements

- Node.js (v18+)
- npm or yarn
- Expo Go app (for testing)
- Android/iOS device or simulator

---

## Quick Start (Testing with Expo Go)

1. **Clone the repo**
   ```bash
   git clone https://github.com/dumzey45/Food_Scan.git
   cd Food_Scan

Install dependenciesBashnpm install
Start the appBashnpx expo start
Open on your phone
Install Expo Go (App Store / Play Store)
Scan the QR code in terminal
App loads instantly!


Note: Internet required — model inference runs on your backend API.

Building Standalone App (APK & IPA)
Use EAS Build to create installable apps for distribution.
1. Install EAS CLI
Bashnpm install -g eas-cli
eas login
2. Configure build profiles (eas.json)
Create or update eas.json in project root:
JSON{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
3. Build APK (Android - installable directly)
Basheas build --platform android --profile preview

Wait 20-40 mins
Download .apk from https://expo.dev (your project → Builds)
Share and install on any Android phone

4. Build IPA (iOS - requires Apple Developer Account $99/year)
Basheas build --platform ios

Download .ipa from expo.dev
Distribute via TestFlight or ad-hoc

Learn more: https://docs.expo.dev/build/introduction/

How It Works

Camera captures photo
Image sent to your backend API
API runs TensorFlow.js model inference
Result returned: Fresh / Rotten + confidence
Displayed instantly in app

Perfect for hackathon demos — fast, accurate, and impressive!

Contributing
Feel free to:

Improve UI
Add more food types
Optimize model
Submit pull requests


License
MIT License — free to use and modify.

Made with 🔥 for hackathons by dumzey45
Scan food. Know freshness. Win the hackathon. 🍎📱🏆
