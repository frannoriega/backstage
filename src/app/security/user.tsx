import { Credential } from "@/services/credentials";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function ScannedUserPage() {
  const { credential: encodedCredential }: { credential: string } =
    useLocalSearchParams();

  const credential = Credential.fromBase64(encodedCredential);

  return (
    <View>
      <Text>
        Datos del usuario: {credential.name}, {credential.photo}
      </Text>
    </View>
  );
}
