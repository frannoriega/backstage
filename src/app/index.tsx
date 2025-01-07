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
    <View className="flex-1 flex-col gap-4 justify-evenly items-center w-full h-full">
      <View className="py-8 flex-initial flex-col gap-4 items-center w-full h-min">
        <Image
          source={require("../../assets/images/logo-fiesta.png")}
          className="w-4/5 h-2/5"
          contentFit="contain"
        />
        <Text className="text-white text-6xl">Backstage</Text>
      </View>
      <View className="flex flex-col gap-4">
        <AuthButton title="Iniciar sesión con Google" onPress={signIn} />
        <Text className={`text-red-200 text-center w-64 ${error ? "visible" : "invisible"}`}>{error}</Text>
      </View>
      <View className={`flex-1 justify-center items-center ${loading ? "visible" : "invisible"}`}>
        <ActivityIndicator size="large" />
      </View>
    </View>
  );
}
