import { supabase } from "@/utils/supabase";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { router, Slot } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import base64 from "react-native-base64";
import { SafeAreaView } from "react-native-safe-area-context";
import { Activity, LogOut, QrCode } from "lucide-react-native";
import { cssInterop } from "nativewind";
import { store } from "@/services/storage";

cssInterop(QrCode, { className: "style" });
cssInterop(Activity, { className: "style" });
cssInterop(LogOut, { className: "style" });

export default function SecurityLayout() {
  async function signOut() {
    await GoogleSignin.signOut();
    router.replace("/");
  }

  useEffect(() => {
    const getKey = async () => {
      const session = await store.getSession();
      if (session) {
        const pk = await supabase.functions.invoke("getPk", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        store.setPrivateKey(base64.decode(pk.data));
      }
    };

    getKey();
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("user, type, users(name, lastname, email)")
        .eq("users.email", "frannoriega.92@gmail.com");
      console.log(data);
    };

    getUser();
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <View className="w-full flex-1">
        <Slot />
      </View>
      <View className="w-full h-fit flex-2 flex-row justify-around bg-black">
        <Pressable
          className="h-full w-full p-4 flex-1 flex-col items-center gap-2"
          onPress={() => router.push("./")}
          android_ripple={{ color: "#111827", borderless: false }}
        >
          <QrCode className="w-14 h-14 text-white" />
          <Text className="text-white">Escanear</Text>
        </Pressable>
        <Pressable
          className="h-full w-full p-4 flex-1 flex-col items-center gap-2"
          onPress={() => router.push("./activity")}
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
