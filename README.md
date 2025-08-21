# 🌦️ BlueAir - Weather Forecast App

![Platform](https://img.shields.io/badge/platform-React%20Native-blue)
![Framework](https://img.shields.io/badge/framework-React%20Native%20CLI-green)
![Language](https://img.shields.io/badge/language-TypeScript-blue)
![License](https://img.shields.io/badge/license-MIT-brightgreen)
![Status](https://img.shields.io/badge/status-active-success)
![Monetization](https://img.shields.io/badge/ads-AdMob-orange)

**BlueAir** is a modern weather forecast app developed using React Native CLI (migrated from Expo) and TypeScript.  
Users can view real-time weather updates and 5-day forecasts based on city names or their current location.  
The app includes AdMob banner ads for monetization and is ready for Play Store distribution.

---

## 🚀 Features

- 🌐 Multi-language support (Turkish, English, Japanese, German, Portuguese)
- 🎨 Theme selection (Light / Dark / Auto)
- 📍 Weather based on current location with GPS support
- 🔍 City search with suggestion system
- ⭐ Save favorite cities
- 🧾 3-hour and 5-day forecast support
- 🎞️ Animated weather icons using Lottie
- 🔐 Secure API key usage via `.env` file
- 🎮 Mini game: Umbrella Rain Catcher - Interactive tap-to-protect game
- 🔔 Background weather notifications
- 📱 Modern edge-to-edge design for Android
- ⚡ Background services for real-time updates
- 🔒 Location permissions for accurate weather data
- 🎯 **AdMob Banner Ads** - Monetization with Google AdMob integration
- 📦 **React Native CLI Build** - Migrated from Expo managed workflow to bare React Native
- 🔧 **Production Ready** - Configured with proper signing keys for Play Store submission
- 🎨 **Optimized UX** - Single banner ad positioned strategically above tab bar
- 🛡️ **Secure Codebase** - Sensitive data properly excluded from version control

---

## 📦 Technologies Used

- React Native CLI 0.79.5 (migrated from Expo)
- TypeScript
- OpenWeatherMap API
- AsyncStorage
- Lottie (for animated weather icons)
- Background Services (Android)
- Location Services (GPS)
- Push Notifications
- **Google Mobile Ads SDK** - react-native-google-mobile-ads
- **AdMob Integration** - Banner ads with test/production environment switching
- **Android Gradle Build System** - Version 8.13 with proper signing configuration

---

## 🔐 Environment Variables

Before running the project, you need to set up your environment variables.

1. Create a `.env` file in the root directory using the provided template:

   ```bash
   cp .env.example .env
   ```

2. Open the .env file and replace the placeholders with your actual API keys:

   ```bash
   OPEN_WEATHER_API_KEY=your_openweathermap_api_key_here
   ADMOB_APP_ID=ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx
   ADMOB_BANNER_ID=ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx
   ```

⚠️ **Important**: 
- Do NOT commit the `.env` file to your repository, as it contains sensitive information
- The app uses test AdMob IDs in development mode and switches to production IDs in release builds
- For AdMob setup, see the detailed guide in `README_ADMOB.md`

## 🎯 AdMob Integration

The app includes Google AdMob banner advertisements for monetization:

### Features:
- 🎯 **Strategic Placement** - Single banner positioned above the tab bar for optimal user experience
- 🔄 **Environment Switching** - Automatically uses test ads in development, production ads in release
- 📱 **Responsive Design** - Banner adapts to different screen sizes with proper safe area handling
- ⚡ **Performance Optimized** - Minimal impact on app performance with efficient ad loading
- 🛡️ **Error Handling** - Graceful fallback when ads fail to load

### Setup:
1. Configure your AdMob account and app
2. Update your `.env` file with production AdMob IDs
3. The app automatically handles test/production switching based on build type

### Ad Placement:
- **Position**: Above the bottom tab navigation
- **Size**: Standard banner (320x50)
- **Visibility**: Persistent across all app tabs
- **UX Impact**: Minimal disruption to content with proper padding adjustments

## 🎮 Umbrella Rain Catcher Game

**Interactive Rain Protection Game** - A unique mini-game that complements the weather theme perfectly! Protect your character from falling raindrops using an umbrella.

### Game Features:
- ☂️ **Tap-to-open umbrella mechanism** - Timing is everything!
- 💧 **Three types of raindrops:**
  - 💧 Normal drops (+1 point)
  - ⭐ Bonus drops (+3 points) 
  - ⚡ Danger drops (+5 points but risk game over)
- 🛒 **In-game shop system** with coins earned from gameplay
- 👤 **Multiple characters to unlock** (Default, Business, Student, Astronaut, etc.)
- ☂️ **Various umbrella designs** (Classic, Purple, Beach, Sun umbrellas)
- 🏆 **High score tracking** with persistent storage
- 🌟 **Progressive difficulty** - Game gets faster as you score higher
- 🎯 **Risk vs Reward** - Danger drops can break through umbrellas but give more points
- 📱 **Haptic feedback** for enhanced mobile experience
- 🌍 **Multi-language support** matching the main app

### How to Play:
1. Tap to open your umbrella when raindrops fall
2. Catch drops to earn points and coins
3. Avoid danger drops or catch them for high risk/reward
4. Use coins to buy new characters and umbrellas
5. Challenge your high score!

## 📱 Permissions

The app requires the following permissions:

**iOS:**
- Location access (when in use and background) for weather updates
- Background app refresh for notifications

**Android:**
- Wake lock permission for background services
- Foreground service permission for weather updates
- Battery optimization exemption for reliable notifications
- Location access for GPS-based weather data

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ismailsoylu/BlueAir.git
   cd BlueAir
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys
   ```

4. **Install iOS dependencies** (macOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

### Running the App

**Android:**
```bash
npx react-native run-android
```

**iOS:**
```bash
npx react-native run-ios
```

### Building for Production

**Android APK:**
```bash
cd android
./gradlew assembleRelease
```

**Android AAB (Play Store):**
```bash
cd android
./gradlew bundleRelease
```

**iOS:**
```bash
# Use Xcode to build and archive for App Store
```

### AdMob Configuration

For detailed AdMob setup instructions, see [README_ADMOB.md](README_ADMOB.md)

### Migration from Expo

This project was migrated from Expo managed workflow to React Native CLI using `expo prebuild`. The migration includes:
- Native Android and iOS project files
- Custom keystore configuration for Play Store
- AdMob native integration
- Proper build configurations for production deployment

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository  
2. **Create** a new branch  
   ```bash
   git checkout -b feature/your-feature
   ```
3. **Commit** your changes  
   ```bash
   git commit -m "Add new feature"
   ```
4. **Push** to the branch  
   ```bash
   git push origin feature/your-feature
   ```
5. **Open** a Pull Request

Thank you for contributing!

---

## 📄 License

This project is licensed under the **MIT License**.  
You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.  
See the [LICENSE](LICENSE) file for full license text.

---

## 📬 Contact

For questions, suggestions, or feedback, feel free to reach out:

- 📧 **Email**: ismailsoylu0405@gmail.com  
- 💻 **GitHub**: [ismailsoylu](https://github.com/ismailsoylu)
---
