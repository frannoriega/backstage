import React, { useState, useEffect, useCallback } from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import crypto from 'react-native-quick-crypto'
import Ajv from "ajv"
import base64 from "react-native-base64"
import { Buffer } from "buffer"

const ajv = new Ajv()

// TODO(fran): Load private key from secure storage
const key = ''

type User = {
  name: string,
  lastname: string,
  email: string,
  photo: string
}

const userSchema = {
  type:
    "object"
  ,
  properties: {
    name: {
      type: "string"
    },
    lastname: {
      type: "string"
    },
    email: {
      type: "string"
    },
    photo: {
      type: "string"
    }
  },
  required: [
    "name",
    "lastname",
    "email",
    "photo"
  ],
};

function decrypt(data: string): User {
  const decrypted = crypto.privateDecrypt(
    {
      key: key,
      // In order to decrypt the data, we need to specify the
      // same hashing function and padding scheme that we used to
      // encrypt the data in the previous step
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(data, 'base64')
  )
  return JSON.parse(decrypted.toString('utf8'))
}

export default function Security() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setScanned(false)

      return () => {
        setScanned(true)
      }
    }, [])
  );

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);


  function handleBarcodeScanned({ data }: { type: any, data: string }) {
    setScanned(true)
    const user = decrypt(data)
    console.log(user)
    const isValid = ajv.validate(userSchema, user)
    if (!isValid) {
      router.push('/security/invalid')
    } else {
      router.push({
        pathname: '/security/user',
        params: {
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          photo: user.photo
        }
      })
    }
  };

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
