import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LanguageContext } from './home';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { lang } = useContext(LanguageContext);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#eee', height: 60 + insets.bottom, paddingBottom: insets.bottom },
        tabBarLabelStyle: { fontSize: 13, marginBottom: 6 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: lang === 'tr' ? 'Anasayfa' : 'Home',
          tabBarLabel: lang === 'tr' ? 'Anasayfa' : 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: lang === 'tr' ? 'Ayarlar' : 'Settings',
          tabBarLabel: lang === 'tr' ? 'Ayarlar' : 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
