import 'dotenv/config';

export default {
  expo: {
    name: "Blue Air",
    displayName: "Blue Air",
    slug: "blueAir",
    version: "1.0.8",
    orientation: "default",
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
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#000000"
      },

      // ✅ Edge-to-Edge uyumluluk
      edgeToEdgeEnabled: true, // API 35 için zorunlu
      statusBar: {
        translucent: true,
        backgroundColor: "transparent", // Tam şeffaf status bar
        barStyle: "light-content"
      },
      navigationBar: {
        visible: true,
        backgroundColor: "#000000",
        barStyle: "light"
      },

      package: "com.ismailjacob.blueAir",
      versionCode: 13,

      allowBackup: true,
      softwareKeyboardLayoutMode: "pan",
      enableProguardInReleaseBuilds: false,
      enableSeparateBuildPerCPUArchitecture: false,

      permissions: [
        "android.permission.WAKE_LOCK",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS"
      ],

      services: [
        {
          name: "com.ismailjacob.blueAir.WeatherService",
          description: "Hava durumu güncelleme servisi"
        }
      ]
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
          image: "./assets/images/splash.png",
          resizeMode: "contain",
          backgroundColor: "#1B2A40"
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