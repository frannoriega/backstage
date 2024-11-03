import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { EventArg } from "@react-navigation/native";
import { Slot, Tabs, router, useLocalSearchParams } from "expo-router";
import { cssInterop } from "nativewind";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



export default function SecurityLayout() {
  async function signOut() {
    await GoogleSignin.signOut()
    router.replace("/")
  }

  return (
    <SafeAreaView className="h-screen overflow-y-scroll flex-1 gap-2">
      <View className="w-full flex-1">
        <Slot />
      </View>
      <View className="w-full h-fit flex-2 p-4 flex-row justify-around">
        <Pressable className="h-full" onPress={() => router.push("./")}>
          <Text>Escanear</Text>
        </Pressable>
        <Pressable onPress={() => router.push("./activity")}>
          <Text>Actividad</Text>
        </Pressable>
        <Pressable onPress={signOut}>
          <Text>Cerrar sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
