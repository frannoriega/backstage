import { Stack } from "expo-router";

// Import your global CSS file
import "./global.css";
import { StyleSheet } from "react-native";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Backstage",
          contentStyle: style.all,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="credential"
        options={{ title: "Credencial", headerShown: true, headerStyle: style.header, headerTitleStyle: style.header, headerTintColor: 'white', contentStyle: style.all }}
      />
      <Stack.Screen
        name="activity/[user]"
        options={{ title: "Credencial", headerShown: true, headerStyle: style.header, headerTitleStyle: style.header, headerTintColor: 'white', contentStyle: style.all }}
      />
      <Stack.Screen
        name="security"
        options={{ title: "Seguridad", headerShown: false, contentStyle: style.all }}
      />
    </Stack>
  );
}

const style = StyleSheet.create({
  all: {
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "black",
    color: "white",
    tintColor: "white",
    textDecorationColor: "white",
    borderColor: "white",
  },
});
