import { Stack } from "expo-router";

// Import your global CSS file
import "./global.css";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{title: 'Backstage'}} />
      <Stack.Screen name="security/index" options={{title: 'Seguridad'}} />
      <Stack.Screen name="security/[user]" options={{title: 'Información'}} />
    </Stack>
  );
}
