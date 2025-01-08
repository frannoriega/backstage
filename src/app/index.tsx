import React, { useEffect, useState } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Image } from "expo-image";
import { ActivityIndicator, Text, View } from "react-native";
import { router } from "expo-router";
import { cssInterop } from "nativewind";
import AuthButton from "@/components/Auth.native";

import { auth } from "@/services/auth";
import { CircleX } from "lucide-react-native";
import ErrorModal from "@/components/error";

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
      setError(error.stack)
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
      <View className="flex flex-col gap-8 h-min w-72 items-center">
        <AuthButton textClassName="text-white font-medium text-lg text-center" className="w-full rounded-md bg-blue-700 p-3" title="Iniciar sesión con Google" onPress={signIn} />
        {error &&
          <ErrorModal stacktrace={error}/>
        }
      </View>
      <View className={`mt-4 flex h-min justify-center items-center ${loading ? "visible" : "invisible"}`}>
        <ActivityIndicator size="large" />
      </View>
    </View>
  );
}
