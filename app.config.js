export default {
  expo: {
    name: "Tandem",
    slug: "tandem",
    version: "1.0.0-beta",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
      package: "com.fockusty.tandem",
      permissions: [
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.INTERNET",
      ],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "aca049ab-3766-4c93-9c0e-df58df5968ad",
      },
    },
    owner: "fockustys-team",
    plugins: [
      "expo-secure-store",
      "expo-file-system",
      "expo-sharing",
      "expo-splash-screen",
      "expo-notifications",
      [
        "expo-dev-client",
        {
          launchMode: "most-recent",
          defaultLaunchURL: "http://localhost:8081",
          android: {
            defaultLaunchURL: "http://10.0.0.2:8081",
          },
        },
      ],
    ],
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#E6F4FE",
    },
  },
};
