import React, { useEffect } from "react";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { cssInterop, verifyInstallation } from "nativewind";
import AuthButton from "@/components/Auth.native";
import { supabase } from "@/utils/supabase";

import { SignInError, auth } from "@/services/auth";
import { store } from "@/services/storage";

cssInterop(Image, { className: "style" });

export default function Index() {
  verifyInstallation();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "336409061120-879kuqilgumm8h397klnrkm1g3vhmq61.apps.googleusercontent.com",
      offlineAccess: false,
    });
  }, []);

  const signIn = async () => {
    try {
      const session = await auth.signIn()
      await store.setSession(session)
      const res = await supabase
        .from("roles")
        .select("type, users(name, lastname, email)")
        .eq("users.email", session.user.email);
      await store.setUser(res.data[0])
      router.push("/security/(tabs)");
    } catch (error: any) {
      if (error instanceof SignInError) {
        //TODO: Handle this gracefully
        console.error("Error occurred during signin: ", error)
      } else {
        console.error(error)
      }
    }
  };

  return (
    <View className="flex-1 flex-col gap-4 items-center w-full h-full">
      <View className="py-8 flex-initial flex-col gap-4 items-center w-full h-min">
        <Image
          source={require("../../assets/images/logo-fiesta.png")}
          className="w-4/5 h-2/5"
          contentFit="contain"
        />
        <Text className="text-white text-6xl">Backstage</Text>
      </View>
      <View>
        <AuthButton title="Iniciar sesión con Google" onPress={signIn} />
      </View>
    </View>
  );
}
