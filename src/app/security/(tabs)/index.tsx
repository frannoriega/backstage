import React, { useState, useEffect, useCallback } from "react";
import { Text, View, StyleSheet, Button, ActivityIndicator } from "react-native";
import { Camera } from "expo-camera";
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

  async function handleBarcodeScanned() {
    //({ data }: { type: any; data: string }) {
    setScanned(true);
    try {
      const data = `cJIcfHQ5ip88SiGM4IHCH3vEy+TQUMSny/vbUp4pvrD0CvQrJgzYIWZ7YPogLuo7YWxyrvaSlMZy+3azUcWFuBTBaR1QMmU642GgDuUOLtIrF0xt2Gd0PA+UHfiyOUJOaO+yiPaBrTtxvGVkXj3b/R0vDj0pzh4rxrL0HFS6817587Ru/PyC9lrALSjWtmt4z8ImY5Shl96sGIdtBNpYpg7QaTm8rEcxABg2nCy9ZAvhrqZmY6nyhKspPxeRkN7H6VQrvj/N8qL9ZSPvQLPZ0yT2GF0wubSHTBeMbW+4MVNOBI83UbR9i+1eJfDMMQS44t6d/nGScYtVsBOFMJlWkVimb5Ky9I1/xUvwCL9+vdXYh4EJWWBybHvr99ES1C2dGuIP1NW3B1Caz48cxvjWT4Ui917RssMpM9aZhIG74pt4yROcxXYv4DcjDhes256d07HrhzeoJSXjc6KftPZaTTggmeC/gJ/V+fvDtdXzkJSF4BX5Jft8QLasAc8tbxyJpJ4aP9k9qMm4LNUfb7XK2zNwi46IhcOSBBkc5jERuDTrvi3d6KspUoVYOuS0oq8ZInQYOGMSNCXHnOKRK8KE4as1txe8pVPqPQSLS+FHk9flPO15fuJXncyIsoqFY3gFKPfInPfOioejXv0Udmrn/mOO1WjC2opoYGVVIvidsoI=`;
      const credential = await credentialService.decrypt(data);
      const controller = await store.getController();
      if (controller) {
        router.push({
          pathname: "/security/user",
          params: {
            credential: Credential.toBase64(credential),
          },
        });
      } else {
        //TODO: Handle error
        router.push("/");
      }
    } catch (error) {
      router.push("/security/invalid")
    }
  }

  if (hasPermission === null) {
    return <ActivityIndicator size="large" />
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 justify-center items-center gap-8">
        <Ban size={64} color={'white'}/>
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
    <View style={styles.container}>
      <Button title="test" onPress={() => handleBarcodeScanned()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
});
