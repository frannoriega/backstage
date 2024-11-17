import { auth } from "@/services/auth";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function LogOutScreen() {

  async function signOut() {
    await auth.signOut();
    router.replace("/");
  }

  return (
    <View>
      <Text className="text-white">¿Seguro que desea salir?</Text>
      <Pressable className="p-4 bg-red-200" onPress={signOut}>
        <Text>Salir</Text>
      </Pressable>
    </View>
  )
}
