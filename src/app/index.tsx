import React, { useEffect } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { cssInterop, verifyInstallation } from "nativewind";
import AuthButton from "@/components/Auth.native";

import { SignInError, SignInErrorReason, auth } from "@/services/auth";
import { store } from "@/services/storage";
import { supabase } from "@/utils/supabase";
import base64 from "react-native-base64";

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
      await auth.signIn();
      const session = await store.getSession();
      if (session) {
        const pk = await supabase.functions.invoke("getPk", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        store.setPrivateKey(base64.decode(pk.data));
      }

      router.push("/security");
    } catch (error: any) {
      if (error instanceof SignInError) {
        switch (error.reason) {
          //TODO: Handle this gracefully
          case SignInErrorReason.UNAUTHORIZED:
            //TODO: Handle unauthorized error
            break;
          default:
            break;
        }
      } else {
      }
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
      <View>
        <AuthButton title="Iniciar sesión con Google" onPress={signIn} />
      </View>
    </View>
  );
}
