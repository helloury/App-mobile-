import React, { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { prepararStorage } from '../store/storage';
import { gastosStore } from '../store/gastosStore';
import { categoriasStore } from '../store/categoriasStore';
import { configStore } from '../store/configStore';
import { missoesStore } from '../store/missoesStore';

export default function RootLayout() {
  const [pronto, setPronto] = useState(false);

  // Confere a versão do esquema e recupera TODOS os dados salvos antes de mostrar qualquer tela
  useEffect(() => {
    prepararStorage()
      .then(() =>
        Promise.all([
          configStore.carregar(),
          gastosStore.carregar(),
          categoriasStore.carregar(),
          missoesStore.carregar(),
        ])
      )
      .finally(() => setPronto(true));
  }, []);

  // Primeira vez no app: vai para o onboarding. Depois disso, abre direto no Painel.
  useEffect(() => {
    if (pronto && !configStore.obter().onboardingConcluido) {
      setTimeout(() => router.replace('/onboarding'), 0);
    }
  }, [pronto]);

  if (!pronto) {
    return (
      <View style={[styles.root, styles.centro]}>
        <ActivityIndicator size="large" color="#E83E8C" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="configurar" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  centro: { justifyContent: 'center', alignItems: 'center' },
});
