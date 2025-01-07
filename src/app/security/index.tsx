import React, { useState, useEffect, useCallback } from "react";
import { Text, View, StyleSheet, Button, ActivityIndicator } from "react-native";
import { Camera, CameraView } from "expo-camera";
import { router, useFocusEffect } from "expo-router";
import { store } from "@/services/storage";
import { credentialService, Credential } from "@/services/credentials";
import { Ban } from "lucide-react-native";

export default function Security() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setScanned(false);

      return () => {
        setScanned(true);
      };
    }, []),
  );

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  async function handleBarcodeScanned(data: { signature: string, data: any }) {
    setScanned(true);
    try {
      const credential = await credentialService.decrypt(data);
      const controller = await store.getController();
      if (controller) {
        router.push({
          pathname: "/credential",
          params: {
            credential: Credential.toBase64(credential),
          },
        });
      } else {
        //TODO: Handle error
        router.push("/");
      }
    } catch (error) {
      console.log(error)
      router.push("/credential/invalid")
    }
  }

  if (hasPermission === null) {
    return <ActivityIndicator size="large" />
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 justify-center items-center gap-8 bg-black">
        <Ban size={64} color={'white'} />
        <Text className="text-2xl text-white">No hay acceso a la cámara</Text>
        <Text className="w-min text-xl text-white text-center">Otorgue permisos a la aplicación para poder escanear</Text>
      </View>
    )
  }

  // <CameraView
  //   onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
  //   barcodeScannerSettings={{
  //     barcodeTypes: ["qr", "pdf417"],
  //   }}
  //   style={StyleSheet.absoluteFillObject}
  // />
  return (
    <View className="flex-1 justify-center">
      <Button title="test" onPress={() => handleBarcodeScanned()} />
    </View>
  );
}
