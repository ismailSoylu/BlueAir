import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

export default function Index() {
  const router = useRouter();
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        if (fontsLoaded) {
          setAppIsReady(true);
        }
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();
  }, [fontsLoaded]);

  useEffect(() => {
    async function onReady() {
      if (appIsReady) {
        await SplashScreen.hideAsync();
        router.replace('/home');
      }
    }
    onReady();
  }, [appIsReady, router]);

  if (!appIsReady) {
    return null; // Splash açık, bekle
  }

  return null; // Render yapma, yönlendirme yapılacak
}