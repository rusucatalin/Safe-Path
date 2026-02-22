import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const { user, isReady } = useAuthStore();

  if (!isReady) {
    return null;
  }

  if (user) {
    return <Redirect href="/(tabs)/map" />;
  }
  return <Redirect href="/(auth)/login" />;
}
