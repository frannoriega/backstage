import React, { useState, useEffect, useCallback } from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { router, useFocusEffect, useNavigation } from "expo-router";
import crypto from 'react-native-quick-crypto'

function decrypt(data: string) {
  const key = `
-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----
  `
  const encrypted = crypto.publicEncrypt({
    key: `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAwx4KuPtNXdnAk2+OqyjUB8x7lmZi0ebj0LpMmf2qvbJXxmdZiVeViCG6hHzuvt2wcFgk1dbEZuyAiNc+4eu0ncXAmKFeHh90R/Ii+Fj3PGd0b7z0z7JM1l09K1C0+lGH/UCIemu5VUD5f0CyHsb4aSLYHTnodMUm3RD7KmArjU94rpq4hcho2vs9PISCALXH3CKd9uniO179qATMMpXj8Od8crbgh5P6XD5c+jzbpGks70H9vHihCR3kkK0VWvwIWR2hOSTZN6Qmq/uoI/eiHfslxaHTfQovIK/kV3ErKNcSQA2w6zW9cuXCktY8rYG9+hpluDPj7zSSbvcztU6WwNYB6w7hK5krQ+Vqun8yoPAqMeu5IsSrHAYQAOCmw+LOr0vSgBArdVo/rqwu/Bc1ayE41E8TLj4cQFp1vjOkLKpn41AoDw9znvzAbuM47LfLR3QCfBeYBNKKDko7BE6/BXRF2OnzfaJyeaO+rvKJDjoMTio0pmHDjpWaPm+n/CekwsI9qa3cpxAe8GaQvwQ2HQn/ewYlH0Rd2GeSCYWoakRvzsG+zi3yTjUf5tzx5P5AXz0Y6yiPR0uMF/UdQjaA8Z1UDBE4F3LRdlOk9LCfv4TAT6bklNTq8Gtvh7WdPOFfVNP2lL4BrboJC7QnAq6CMT3pAIlx0Ujdzkgmvk1In7MCAwEAAQ==
-----END PUBLIC KEY-----`,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: "sha256"
  },
  "Banana")
  const decrypted = crypto.privateDecrypt(
    {
      key: key,
      // In order to decrypt the data, we need to specify the
      // same hashing function and padding scheme that we used to
      // encrypt the data in the previous step
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    encrypted
  )
  console.log(decrypted.toString())
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


  function handleBarcodeScanned({ type, data }: { type: any, data: string }) {
    const decrypted = decrypt(data)
    console.log(decrypted)
    setScanned(true)
    router.push(`./${data}`)
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
      {scanned && (
        <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
      )}
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
