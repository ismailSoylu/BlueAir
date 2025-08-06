# 🌦️ BlueAir - Weather Forecast App

![Platform](https://img.shields.io/badge/platform-React%20Native-blue)
![Framework](https://img.shields.io/badge/framework-Expo-green)
![Language](https://img.shields.io/badge/language-TypeScript-blue)
![License](https://img.shields.io/badge/license-MIT-brightgreen)
![Status](https://img.shields.io/badge/status-active-success)

**BlueAir** is a modern weather forecast app developed using React Native and TypeScript.  
Users can view real-time weather updates and 5-day forecasts based on city names or their current location.

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

---

## 📦 Technologies Used

- React Native (Expo)
- TypeScript
- OpenWeatherMap API
- AsyncStorage
- Lottie (for animated weather icons)
- Background Services (Android)
- Location Services (GPS)
- Push Notifications

---

## 🔐 Environment Variables

Before running the project, you need to set up your environment variables.

1. Create a `.env` file in the root directory using the provided template:

   ```bash
   cp .env.example .env

2. Open the .env file and replace the placeholder with your actual OpenWeatherMap API key:

   ```bash
   OPEN_WEATHER_API_KEY=your_openweathermap_api_key_here

⚠️ Important: Do NOT commit the .env file to your repository, as it contains sensitive information.

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

## ⚙️ Installation

```bash
git clone https://github.com/ismailsoylu/BlueAir.git
cd BlueAir
npm install
npx expo start
```

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
