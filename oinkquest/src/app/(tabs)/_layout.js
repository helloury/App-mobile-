import { Tabs } from 'expo-router';
import { Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  // Garante um respiro mínimo no Android mesmo se o aparelho não reportar barra de gestos alta
  const bottomInset = Platform.OS === 'android' ? Math.max(insets.bottom, 10) : insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E83E8C',
        tabBarInactiveTintColor: '#6C757D',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E9ECEF',
          // Aumenta a altura total para 68px + a área segura, dando espaço vertical de sobra
          height: 68 + bottomInset,
          paddingTop: 8,
          // Evita empurrar o texto demais para cima
          paddingBottom: bottomInset + 4,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2, // Separa o texto do ícone
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Painel',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="registro"
        options={{
          title: 'Registrar',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>➕</Text>,
        }}
      />
      <Tabs.Screen
        name="metas"
        options={{
          title: 'Metas',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🎯</Text>,
        }}
      />
      <Tabs.Screen
        name="missoes"
        options={{
          title: 'Missões',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⚔️</Text>,
        }}
      />
    </Tabs>
  );
}