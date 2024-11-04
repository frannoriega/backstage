import React, { useState, useEffect, useCallback } from "react";
import { Text, View, StyleSheet } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { router, useFocusEffect } from "expo-router";
import crypto from "react-native-quick-crypto";
import Ajv from "ajv";
import { Buffer } from "buffer";
import { supabase } from "@/utils/supabase";
import base64 from "react-native-base64";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ajv = new Ajv();

type User = {
  name: string;
  lastname: string;
  email: string;
  photo: string;
};

const userSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
    },
    lastname: {
      type: "string",
    },
    email: {
      type: "string",
    },
    photo: {
      type: "string",
    },
  },
  required: ["name", "lastname", "email", "photo"],
};

function decrypt(key: string, data: string): User {
  console.log(key);
  const decrypted = crypto.privateDecrypt(
    {
      key: base64.decode(key), // In order to decrypt the data, we need to specify the
      // same hashing function and padding scheme that we used to
      // encrypt the data in the previous step
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(data, "base64"),
  );
  return JSON.parse(decrypted.toString("utf8"));
}

export default function Security() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [pk, setPk] = useState("");

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

  useEffect(() => {
    const getPk = async () => {
      const accessToken = await AsyncStorage.getItem("session");
      const pk = await supabase.functions.invoke("getPk", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("Private key: ", pk);
      setPk(pk.data || "");
    };
    getPk();
  }, []);

  function handleBarcodeScanned({ data }: { type: any; data: string }) {
    setScanned(true);
    const user = decrypt(pk, data);
    const isValid = ajv.validate(userSchema, user);
    if (!isValid) {
      router.push("/security/invalid");
    } else {
      router.push({
        pathname: "/security/user",
        params: {
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          photo: user.photo,
        },
      });
    }
  }

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417"],
        }}
        style={StyleSheet.absoluteFillObject}
      />
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
