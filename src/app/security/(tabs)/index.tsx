import React, { useState, useEffect, useCallback } from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { Camera } from "expo-camera";
import { router, useFocusEffect } from "expo-router";
import { store } from "@/services/storage";
import { credentialService, Credential } from "@/services/credentials";

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
      const data = `GxzStVTgc6ZcazNpy/FXtFKfFXGH6KPgLITzUSG38Mad+XlhCV/ZAS2F/UPyvguuztPvmyHRdWko3E+RiMLpQTNNeaAuO8JvBR5fmwfIqa+RGhfbz3SCKcIynsLXXarXqJLbS5fyeplD8kQnv7J99rrvEBy+EtejlSLDekAkjtevqMfv4Gh+RSA7HDniMyDkUeA2vxIHHQEuvEjQMVHnB9bVKxRgWhUYAZgyAixwWQkf47m6XjmCkg4C8BbZbwzg5wF9D3hdRECx1KyVSHY5YHq6XlqPuZAu/7yT/149ue4LC1kAwwhHzRxeHXGh8FNT1ZQq+l7OGEeAk7PURGRH/E9LCBNO9dVXfChDkRNqAfvAKwuljC/S65RLiaK+a+idB9GoiCpbKn5cE4QsL3ep3wfRpOxinCtoHjmRuiJraFR2SatCy8f6w+KLDBYxm8Sra8z7mDpuxwNtwQXKE8k+mp8w2HKEpUykA2Yfi56H5RXXtN28+htnXZFS9kSmM1jqge5WWziex6g1WCrBZ6sBTO2lNtqNgvdY5G9ZmB++CSGL7KtvYYkdTI3GY1Hb3k+hOyq0xV1GriSGh09B8ceCVB1r5Ixj2eBE7shKlbRDv3kh0QRS/CoZQd6/QnTmJom5Lkb6POWcGJDYLjU5/UPGIhdnuCB45Q7csprUA1wBnE0=`;
      const credential = await credentialService.decrypt(data);
      const controller = await store.getController();
      if (controller) {
        router.push({
          pathname: "/security/user",
          params: {
            controllerId: controller.id,
            gate: controller.gate,
            credential: Credential.toBase64(credential),
          },
        });
      } else {
        //TODO: Handle error
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      //TODO: Handle error
    }
  }

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
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
