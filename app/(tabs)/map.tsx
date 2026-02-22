import { View, StyleSheet } from 'react-native';
import { LeafletMap } from '@/components/MapView/LeafletMap';
import { CHISINAU_CENTER } from '@/constants/chisinau';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <LeafletMap center={CHISINAU_CENTER} markers={[]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
