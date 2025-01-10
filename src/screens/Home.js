import { View, Text, StyleSheet } from 'react-native';
import { House } from 'phosphor-react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Page</Text>
      <House weight="fill" color="blue" size={28}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});