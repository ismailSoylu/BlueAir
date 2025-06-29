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
      supportsTablet: true,
      bundleIdentifier: "com.ismailjacob.blueAir",
      infoPlist: {
        UIBackgroundModes: ["background-fetch", "background-processing"],
        NSLocationWhenInUseUsageDescription: "Hava durumu bilgisi için konumunuza ihtiyaç duyuyoruz.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Arka plan hava durumu bildirimleri için konumunuza ihtiyaç duyuyoruz."
      }
    },
    android: {
      supportsTablet: true,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png", // ✅ doğru ikon
        backgroundColor: "#000000"                   // ✅ arka plan ile uyumlu
      },
      edgeToEdgeEnabled: true,
      package: "com.ismailjacob.blueAir",
      // Uygulama arka planda kalırken state'i koru
      allowBackup: true,
      // Ekran kilitlendiğinde uygulamayı koru
      softwareKeyboardLayoutMode: "pan",
      // Memory yönetimi
      enableProguardInReleaseBuilds: false,
      enableSeparateBuildPerCPUArchitecture: false,
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