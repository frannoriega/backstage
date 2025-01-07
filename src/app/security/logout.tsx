import { auth } from "@/services/auth";
import { router } from "expo-router";
import { DoorOpen } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

export default function LogOutScreen() {

  async function signOut() {
    await auth.signOut();
    router.replace("/");
  }

  return (
    <View className="w-full h-full flex flex-col items-center justify-center p-4">
      <View style={{elevation: 1}} className="bg-white rounded-xl p-8 w-4/5 flex flex-col items-center justify-center gap-4">
        <Text className="w-full text-center text-2xl">¿Seguro que desea salir?</Text>
        <Pressable className="p-4 bg-red-400 flex flex-col items-center rounded-xl" onPress={signOut}>
          <DoorOpen size={48} color='black'/>
        </Pressable>
      </View>
    </View>
  )
}
