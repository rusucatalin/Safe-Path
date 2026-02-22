import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Deconectare', 'Ești sigur?', [
      { text: 'Anulare', style: 'cancel' },
      {
        text: 'Deconectare',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.email}>{user?.email ?? '—'}</Text>
        <Text style={styles.name}>{user?.displayName ?? 'Utilizator'}</Text>
      </View>
      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Deconectare</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 24 },
  card: { backgroundColor: '#16213e', borderRadius: 12, padding: 20, marginBottom: 24 },
  email: { color: '#a0a0a0', fontSize: 14 },
  name: { color: '#eee', fontSize: 18, fontWeight: '600', marginTop: 4 },
  logout: { backgroundColor: '#0f3460', borderRadius: 12, padding: 16, alignItems: 'center' },
  logoutText: { color: '#e94560', fontSize: 16, fontWeight: '600' },
});
