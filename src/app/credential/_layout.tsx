
import { Stack } from "expo-router";

import { StyleSheet } from "react-native";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Credencial",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="invalid"
        options={{ title: "Credencial", headerShown: false }}
      />
    </Stack>
  );
}

const style = StyleSheet.create({
  all: {
    backgroundColor: "black",
  },
  header: {
    backgroundColor: "black",
    color: "white",
  },
});
