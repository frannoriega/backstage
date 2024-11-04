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
import AsyncStorage from "@react-native-async-storage/async-storage";

cssInterop(Image, { className: "style" });

export default function Index() {
  verifyInstallation();

  useEffect(() => {
    console.log(process.env);
    console.log(process.env.IOS_CLIENT_ID);
    GoogleSignin.configure({
      webClientId:
        "336409061120-879kuqilgumm8h397klnrkm1g3vhmq61.apps.googleusercontent.com",
      iosClientId: process.env.IOS_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo);
      if (userInfo.data.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: userInfo.data.idToken,
          options: {
            redirectTo: "http://localhost:3000/callback",
          },
        });
        console.log("Error: ", error);
        console.log(data);
        await AsyncStorage.setItem("session", data.session?.access_token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        console.log(await AsyncStorage.getItem("session"));
        router.push("/security/(tabs)");
      } else {
        throw new Error("no ID token present!");
      }
    } catch (error: any) {
      console.log("Sign in error: ", error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
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
