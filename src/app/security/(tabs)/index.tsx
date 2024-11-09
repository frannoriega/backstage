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
      const data = `QoRkHbE4zOhBXgGPvd8/B2upkf0g56fN71Z9dHVM2acZufe3zXx1o/+1IPUkoBcvMeEPfLxJhz/MQDGfLs30HNOPtiP+rxYgjhz8kUCe4qP/+ZMe1s+WFUilBWTi6yWbwUxCZ/9p093Xp/JkdKSmmS1EHt0Px6eD/1xxPBIe3fSBqMf1BcoDPcizsibxTLfXYAbfkNP9h6KMXk9pZsyL07l3tFop8MKij6XZYxHbDvJKgvL49T8WHZNvel1pRWSX4cqykyyedjo6gu1aHTNiVkq5VsrLmh9oTJsKNxb70wHMsyYzT3LrrGXCskgSiyFFdoLi2bn2riEDmkON1INivyjfYo3FjfNjkW8BKmyyRKXCmFec+138EKDpMINmncOFmerT37DYYaS+Yji1cUFeUhNDZN6caf2DN59dxq03GkLh2bSa/jjo8dEeSKd3eGtXg+e3DZCSQzzjLAvFkcb6DTbHcoMtLYcT3gcJGzwhxcP4o4HlpkjX2/alZWrfWxo5AptkORIqOxZKcPkVNlC4DSmWezBLoRIUgbrbVknBv7ATNxMYABzCWTUXEJRpsGnB2ZZNsm11Iu6sMgdBFTBkca+5gV20NVhee2ALhZ/pXf/CAAulAKDc1YTJ+KQGn0+5p3E0vTWTB2dsCTV39ZGnDXQ+ayXpXJ2We5w4PZwVk/c=`;
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
