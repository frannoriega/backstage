
import { Stack } from "expo-router";

import { StyleSheet } from "react-native";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Credencial",
          contentStyle: style.all,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="invalid"
        options={{ title: "Credencial", headerShown: false, contentStyle: style.all }}
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
