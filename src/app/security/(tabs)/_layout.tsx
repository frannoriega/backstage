import { supabase } from "@/utils/supabase";
import { router, Slot, Tabs } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Activity, LogOut, QrCode } from "lucide-react-native";
import { cssInterop } from "nativewind";
import { auth } from "@/services/auth";

cssInterop(QrCode, { className: "style" });
cssInterop(Activity, { className: "style" });
cssInterop(LogOut, { className: "style" });

export default function SecurityLayout() {
  async function signOut() {
    await auth.signOut();
    router.replace("/");
  }

  return (
    <SafeAreaView className="flex-1">
      <View className="w-full flex-1">
        <Slot />
      </View>
      <View className="w-full h-fit flex-2 flex-row justify-around bg-black">
        <Pressable
          className="h-full w-full p-4 flex-1 flex-col items-center gap-2"
          onPress={() => router.push("/security/(tabs)")}
          android_ripple={{ color: "#111827", borderless: false }}
        >
          <QrCode className="w-14 h-14 text-white" />
          <Text className="text-white">Escanear</Text>
        </Pressable>
        <Pressable
          className="h-full w-full p-4 flex-1 flex-col items-center gap-2"
          onPress={() => router.push("/security/(tabs)/activity")}
          android_ripple={{ color: "#111827", borderless: false }}
        >
          <Activity className="w-14 h-14 text-white" />
          <Text className="text-white">Actividad</Text>
        </Pressable>
        <Pressable
          className="h-full w-full p-4 flex-1 flex-col items-center gap-2"
          onPress={signOut}
          android_ripple={{ color: "#111827", borderless: false }}
        >
          <LogOut className="w-14 h-14 text-white" />
          <Text className="text-white">Cerrar sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );

}
