import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#202020' },
        headerTintColor: '#eee',
        tabBarStyle: { backgroundColor: '#202020' },
        tabBarActiveTintColor: '#e94560',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tabs.Screen name="map" options={{ title: 'Hartă', tabBarLabel: 'Hartă' }} />
      <Tabs.Screen name="report" options={{ title: 'Raportează', tabBarLabel: 'Raportează' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarLabel: 'Profil' }} />
    </Tabs>
  );
}
