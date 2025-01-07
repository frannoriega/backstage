import React, { useEffect, useState } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Image } from "expo-image";
import { ActivityIndicator, Text, View } from "react-native";
import { router } from "expo-router";
import { cssInterop, verifyInstallation } from "nativewind";
import AuthButton from "@/components/Auth.native";

import { SignInError, SignInErrorReason, auth } from "@/services/auth";
import { store } from "@/services/storage";
import { supabase } from "@/utils/supabase";
import base64 from "react-native-base64";
import { SafeAreaView } from "react-native-safe-area-context";

cssInterop(Image, { className: "style" });

export default function Index() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "336409061120-879kuqilgumm8h397klnrkm1g3vhmq61.apps.googleusercontent.com",
      offlineAccess: false,
    });
  }, []);

  const signIn = async () => {
    try {
      setError(null)
      setLoading(true)
      throw new Error()
      await auth.signIn();
      router.push("/security");
    } catch (error: any) {
      console.error(error)
      setError("Ocurrió un error al iniciar sesión.\n Intente más tarde o contáctese con Francisco Noriega")
    } finally {
      setLoading(false)
    }
  };

  return (
    <View className="flex-1 flex-col justify-center items-center w-full">
      <View className="py-8 flex flex-col gap-4 items-center w-full h-min">
        <Image
          source={require("../../assets/images/logo-fiesta.png")}
          className="p-8 w-full h-2/5"
          contentFit="contain"
        />
        <Text className="text-white text-6xl">Backstage</Text>
      </View>
      <View className="flex flex-col gap-4 h-min items-center">
        <AuthButton title="Iniciar sesión con Google" onPress={signIn} />
        <Text className={`text-red-200 text-center w-20 ${error ? "visible" : "invisible"}`}>{error}</Text>
      </View>
      <View className={`flex h-min justify-center items-center ${loading ? "visible" : "invisible"}`}>
        <ActivityIndicator size="large" />
      </View>
    </View>
  );
}
