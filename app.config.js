import 'dotenv/config';

export default {
  expo: {
    name: "Blue Air",
    displayName: "Blue Air",
    slug: "blueAir",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "blueair",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png", // ✅ doğru ikon
        backgroundColor: "#000000"                   // ✅ arka plan ile uyumlu
      },
      edgeToEdgeEnabled: true,
      package: "com.ismailjacob.blueAir"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/icon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash.png",       // ✅ gerçek splash görseli
          resizeMode: "contain",
          backgroundColor: "#1B2A40"                 // ✅ tema uyumu
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      openWeatherApiKey: process.env.OPEN_WEATHER_API_KEY,
      router: {},
      eas: {
        projectId: "85bd3f77-8dda-47f3-af54-dec3fa193c15"
      }
    }
  }
};